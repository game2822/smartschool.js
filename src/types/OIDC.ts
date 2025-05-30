export interface OIDCProviderMetadata {
    issuer: string;
    scopes_supported: Array<string>;
    response_types_supported: Array<string>;
    response_modes_supported: Array<string>;
    subject_types_supported: Array<string>;
    claim_types_supported: Array<string>;
    claims_supported: Array<string>;
    grant_types_supported: Array<string>;
    id_token_signing_alg_values_supported: Array<string>;
    dpop_signing_alg_values_supported: Array<string>;
    id_token_encryption_alg_values_supported: Array<string>;
    id_token_encryption_enc_values_supported: Array<string>;
    userinfo_signing_alg_values_supported: Array<string>;
    userinfo_encryption_alg_values_supported: Array<string>;
    userinfo_encryption_enc_values_supported: Array<string>;
    request_object_signing_alg_values_supported: Array<string>;
    request_object_encryption_alg_values_supported: Array<string>;
    request_object_encryption_enc_values_supported: Array<string>;
    introspection_endpoint_auth_methods_supported: Array<string>;
    token_endpoint_auth_methods_supported: Array<string>;
    code_challenge_methods_supported: Array<string>;
    prompt_values_supported: Array<string>;
    claims_parameter_supported: boolean;
    request_uri_parameter_supported: boolean;
    request_parameter_supported: boolean;
    backchannel_logout_supported: boolean;
    frontchannel_logout_supported: boolean;
    backchannel_logout_session_supported: boolean;
    frontchannel_logout_session_supported: boolean;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    registration_endpoint: string;
    end_session_endpoint: string;
    introspection_endpoint: string;
    revocation_endpoint: string;
    pushed_authorization_request_endpoint: string;
    jwks_uri: string;
}

export interface JWK {
    kty: string;       // Key Type (e.g., "RSA")
    kid: string;       // Key ID
    use: string;       // Public Key Use (e.g., "sig" for signature)
    alg: string;       // Algorithm (e.g., "RS256")
    n: string;         // Modulus (base64url-encoded)
    e: string;         // Exponent (base64url-encoded)
}

export interface JWKS {
    keys: Array<JWK>;
}

export interface Endpoints {
    wellKnown: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revokeEndpoint: string;
}

export interface OIDCAccessToken {
    access_token: string;
    id_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export interface JWTPayload {
    aud: string;
    sub: string;
    profile: "Eleve" | string;
    iss: string;
    given_name: string;
    exp: number;
    iat: number;
    family_name: string;
    jti: string;
    email: string;
}
