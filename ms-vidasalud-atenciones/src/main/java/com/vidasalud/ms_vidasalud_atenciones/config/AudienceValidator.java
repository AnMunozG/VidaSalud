package com.vidasalud.ms_vidasalud_atenciones.config;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

/**
 * Valida que el claim "aud" del access token de Azure AD corresponda
 * al audience de la API (Application ID URI: api://6db95f4d-96a5-47ca-bc8e-e43bd5eda9ab).
 */
public class AudienceValidator implements OAuth2TokenValidator<Jwt> {

    private final String audience;

    public AudienceValidator(String audience) {
        this.audience = audience;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        Object aud = jwt.getClaims().get("aud");
        boolean valido = false;
        if (aud instanceof String s) {
            valido = s.equals(audience);
        } else if (aud instanceof List<?> lista) {
            valido = lista.contains(audience);
        }
        return valido
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error(
                        "invalid_token",
                        "Audiencia invalida: se esperaba " + audience,
                        null));
    }
}