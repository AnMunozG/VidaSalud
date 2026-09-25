package com.vidasalud.bff.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Proxy transparente del BFF.
 *
 * <p>Qué hace: reenvía cada petición que llega al BFF hacia el microservicio
 * de destino conservando método HTTP, ruta, query params, cabeceras y cuerpo.
 * La respuesta del microservicio se devuelve igual (estado + cuerpo).</p>
 *
 * <p>A dónde van las peticiones (rutas expuestas por el BFF):</p>
 * <ul>
 *   <li>{@code /api/catalogo/**}   -&gt; ms-vidasalud-catalogo (puerto 8081)</li>
 *   <li>{@code /api/atenciones/**} -&gt; ms-vidasalud-atenciones (puerto 8082)</li>
 * </ul>
 *
 * <p>Seguridad: la validación del token (Azure AD) la hace la cadena de filtros
 * de Spring Security definida en {@code config.SecurityConfig}; este controller
 * solo se ejecuta cuando el token ya pasó esa validación. Además, cada ruta y
 * método HTTP exige un rol concreto con {@code @PreAuthorize} (roles Azure
 * normalizados: ADMIN, RECEPCIONISTA, PACIENTE, AUDITOR):</p>
 * <ul>
 *   <li>{@code /api/catalogo/**}   - GET: ADMIN/RECEPCIONISTA/PACIENTE · escrituras: ADMIN/RECEPCIONISTA</li>
 *   <li>{@code /api/atenciones/**} - GET/POST/PUT: ADMIN/RECEPCIONISTA/PACIENTE · DELETE: ADMIN</li>
 * </ul>
 */
@RestController
public class GatewayProxyController {

    // Cabeceras "hop-by-hop" que NO se reenvían (son de un salto de red, no del recurso).
    private static final Set<String> CABECERAS_NO_REENVIABLES = Set.of(
            HttpHeaders.HOST,
            HttpHeaders.CONNECTION,
            HttpHeaders.CONTENT_LENGTH,
            HttpHeaders.TRANSFER_ENCODING,
            HttpHeaders.UPGRADE,
            "Keep-Alive",
            "Proxy-Connection",
            "TE",
            "Trailer"
    );

    private final RestTemplate restTemplate;
    private final String catalogoBaseUrl;
    private final String atencionesBaseUrl;

    public GatewayProxyController(RestTemplate restTemplate,
                                  @Value("${bff.catalogo.base-url}") String catalogoBaseUrl,
                                  @Value("${bff.atenciones.base-url}") String atencionesBaseUrl) {
        this.restTemplate = restTemplate;
        this.catalogoBaseUrl = catalogoBaseUrl;
        this.atencionesBaseUrl = atencionesBaseUrl;
    }

    /** Roles con acceso a la lectura del catálogo (lo consultan también los pacientes). */
    private static final String ROLES_CATALOGO_LECTURA = "hasAnyRole('ADMIN', 'RECEPCIONISTA', 'PACIENTE')";
    /** Roles con acceso a las escrituras sobre el catálogo. */
    private static final String ROLES_CATALOGO_ESCRITURA = "hasAnyRole('ADMIN', 'RECEPCIONISTA')";
    /** Roles con acceso a lectura/creación/actualización de atenciones. */
    private static final String ROLES_ATENCIONES_GESTION = "hasAnyRole('ADMIN', 'RECEPCIONISTA', 'PACIENTE')";

    @GetMapping("/api/catalogo/**")
    @PreAuthorize(ROLES_CATALOGO_LECTURA)
    public ResponseEntity<byte[]> catalogoLeer(HttpServletRequest request) {
        return reenviarConManejo(request, null, catalogoBaseUrl);
    }

    @RequestMapping(value = "/api/catalogo/**", method = {RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @PreAuthorize(ROLES_CATALOGO_ESCRITURA)
    public ResponseEntity<byte[]> catalogoEscribir(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return reenviarConManejo(request, body, catalogoBaseUrl);
    }

    @GetMapping("/api/atenciones/**")
    @PreAuthorize(ROLES_ATENCIONES_GESTION)
    public ResponseEntity<byte[]> atencionesLeer(HttpServletRequest request) {
        return reenviarConManejo(request, null, atencionesBaseUrl);
    }

    @PostMapping("/api/atenciones/**")
    @PreAuthorize(ROLES_ATENCIONES_GESTION)
    public ResponseEntity<byte[]> atencionesCrear(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return reenviarConManejo(request, body, atencionesBaseUrl);
    }

    @RequestMapping(value = "/api/atenciones/**", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize(ROLES_ATENCIONES_GESTION)
    public ResponseEntity<byte[]> atencionesActualizar(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return reenviarConManejo(request, body, atencionesBaseUrl);
    }

    @DeleteMapping("/api/atenciones/**")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> atencionesEliminar(HttpServletRequest request) {
        return reenviarConManejo(request, null, atencionesBaseUrl);
    }

    private ResponseEntity<byte[]> reenviarConManejo(HttpServletRequest request, byte[] body, String baseUrl) {
        String targetUrl = construirUrlDestino(baseUrl, request);

        try {
            return reenviar(request, body, targetUrl);
        } catch (ResourceAccessException ex) {
            // No se pudo conectar con el microservicio destino -> 502 Bad Gateway
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(("{\"error\":\"El servicio de destino no está disponible\",\"servicio\":\"" + targetUrl + "\"}")
                            .getBytes(StandardCharsets.UTF_8));
        }
    }

    private String construirUrlDestino(String baseUrl, HttpServletRequest request) {
        String url = baseUrl + request.getRequestURI();
        String query = request.getQueryString();
        if (query != null && !query.isBlank()) {
            url += "?" + query;
        }
        return url;
    }

    private ResponseEntity<byte[]> reenviar(HttpServletRequest request, byte[] body, String targetUrl) {
        HttpHeaders headers = copiarCabeceras(request);
        HttpMethod metodo = HttpMethod.valueOf(request.getMethod().toUpperCase(Locale.ROOT));
        RequestEntity<byte[]> peticion = new RequestEntity<>(body, headers, metodo, URI.create(targetUrl));
        ResponseEntity<byte[]> respuesta = restTemplate.exchange(peticion, byte[].class);

        // Se construye una respuesta NUEVA y limpia. No se reenvían las cabeceras
        // del upstream relacionadas con el framing (Content-Length, Transfer-Encoding)
        // ni las hop-by-hop: si se copiaran, el contenedor podría emitir una respuesta
        // de trozos (chunked) inválida y nginx la descartaría (ERR_EMPTY_RESPONSE).
        HttpHeaders cabecerasRespuesta = new HttpHeaders();
        MediaType contentType = respuesta.getHeaders().getContentType();
        if (contentType != null) {
            cabecerasRespuesta.setContentType(contentType);
        }
        copiarCabeceraSiExiste(respuesta.getHeaders(), cabecerasRespuesta, HttpHeaders.LOCATION);
        copiarCabeceraSiExiste(respuesta.getHeaders(), cabecerasRespuesta, HttpHeaders.ETAG);

        byte[] cuerpo = respuesta.getBody() != null ? respuesta.getBody() : new byte[0];
        return ResponseEntity.status(respuesta.getStatusCode())
                .headers(cabecerasRespuesta)
                .body(cuerpo);
    }

    /** Copia una cabecera concreta del upstream si viene presente. */
    private void copiarCabeceraSiExiste(HttpHeaders origen, HttpHeaders destino, String nombre) {
        List<String> valores = origen.get(nombre);
        if (valores != null && !valores.isEmpty()) {
            destino.put(nombre, new ArrayList<>(valores));
        }
    }

    /** Copia todas las cabeceras de la petición original, menos las de un solo salto. */
    private HttpHeaders copiarCabeceras(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        Collections.list(request.getHeaderNames())
                .forEach(nombre -> headers.put(nombre, Collections.list(request.getHeaders(nombre))));
        CABECERAS_NO_REENVIABLES.forEach(headers::remove);
        return headers;
    }
}