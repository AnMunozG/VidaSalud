package com.vidasalud.bff.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Seguridad del BFF (Backend for Frontend) y única puerta de entrada del frontend.
 *
 * <p>Flujo resumido:</p>
 * <ol>
 *   <li>El frontend inicia sesión con la App Registration del SPA en Azure AD
 *       y obtiene un access token (audiencia = esta API).</li>
 *   <li>Cada petición llega con la cabecera {@code Authorization: Bearer <token>}.</li>
 *   <li>Aquí se valida el token: firma (con las claves JWKS de Azure AD),
 *       emisor (issuer) y audiencia (el Application ID URI de la API).</li>
 *   <li>Los App Roles del token (claim {@code roles}) se convierten en autoridades
 *       {@code ROLE_<rol>} para poder autorizar con {@code @PreAuthorize}.</li>
 * </ol>
 *
 * <p>Todo lo que toca seguridad vive en esta misma clase (firewall HTTP, CORS y
 * validación del token) para que el BFF sea fácil de leer y de mantener.</p>
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${azure.issuer-uri}")
    private String issuerUri;

    @Value("${azure.jwk-set-uri}")
    private String jwkSetUri;

    @Value("${azure.audience}")
    private String audience;

    @Value("${bff.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/favicon.ico", "/webjars/**", "/actuator/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint((req, res, ex) -> escribirError(res, 401,
                                "Se requiere un access token de Azure AD valido (Bearer).", ex.getMessage()))
                        .accessDeniedHandler(deniedHandler()))
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
        return http.build();
    }

    /**
     * Fuente única de configuración CORS. Con este bean, Spring Security aplica
     * la misma política CORS a todas las rutas y el preflight (OPTIONS) funciona
     * para cualquier método.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Decodifica y valida el token. La firma se comprueba contra las claves
     * públicas de Azure AD ({@code jwkSetUri}); además se exige el emisor
     * correcto (issuer) y la audiencia de esta API.
     */
    @Bean
    JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(issuerUri),
                validadorAudiencia(audience)));
        return decoder;
    }

    /**
     * Convierte el claim de App Roles de Azure AD ({@code roles}) en autoridades
     * de Spring Security. P. ej. {@code roles: ["admin"]} => {@code ROLE_ADMIN}.
     *
     * <p>Los nombres se normalizan igual que el frontend: {@code admin}/{@code administrador}
     * => {@code ROLE_ADMIN}, {@code auditor} => {@code ROLE_AUDITOR},
     * {@code operador}/{@code recepcionista} => {@code ROLE_RECEPCIONISTA} y cualquier
     * otro valor (o ausencia de claim) => {@code ROLE_PACIENTE}. Así las reglas
     * {@code hasRole(...)} coinciden sin importar cómo Azure nombre los App Roles.</p>
     */
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles == null || roles.isEmpty()) {
                return List.of(new SimpleGrantedAuthority("ROLE_PACIENTE"));
            }
            return roles.stream()
                    .map(role -> normalizeRol(role))
                    .distinct()
                    .collect(Collectors.toList());
        });
        return converter;
    }

    private static SimpleGrantedAuthority normalizeRol(String rol) {
        String nombre = rol.toLowerCase(Locale.ROOT).trim();
        if (nombre.equals("admin") || nombre.equals("administrador")) {
            return new SimpleGrantedAuthority("ROLE_ADMIN");
        }
        if (nombre.equals("auditor")) {
            return new SimpleGrantedAuthority("ROLE_AUDITOR");
        }
        if (nombre.equals("operador") || nombre.equals("recepcionista")) {
            return new SimpleGrantedAuthority("ROLE_RECEPCIONISTA");
        }
        return new SimpleGrantedAuthority("ROLE_PACIENTE");
    }

    // ── Validadores y respuestas de error ────────────────────────────────

    private static OAuth2TokenValidator<Jwt> validadorAudiencia(String audienceEsperadaCsv) {
        List<String> esperadas = java.util.Arrays.stream(audienceEsperadaCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        return jwt -> {
            List<String> received = jwt.getAudience();
            boolean valido = received != null && received.stream().anyMatch(esperadas::contains);
            return valido
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error(
                            "invalid_token",
                            "Audiencia invalida. Esperadas: " + esperadas + ". Recibida: " + received + ". Issuer: " + jwt.getIssuer(),
                            null));
        };
    }

    private AccessDeniedHandler deniedHandler() {
        return (req, res, ex) -> escribirError(res, 403,
                "El rol del usuario no tiene permiso para esta operacion.", null);
    }

    private void escribirError(HttpServletResponse res, int status, String detalle, String motivo) throws java.io.IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        String motivoJson = (motivo == null) ? "null" : "\"" + motivo.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
        res.getWriter().write("{\"error\":\"access_denied\",\"detalle\":\"" + detalle + "\",\"motivo\":" + motivoJson + "}");
    }
}