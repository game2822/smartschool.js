type OIDCProviderMetadata = {
  issuer: string;
  scopes_supported: string[];
  response_types_supported: string[];
  response_modes_supported: string[];
  subject_types_supported: string[];
  claim_types_supported: string[];
  claims_supported: string[];
  grant_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  dpop_signing_alg_values_supported: string[];
  id_token_encryption_alg_values_supported: string[];
  id_token_encryption_enc_values_supported: string[];
  userinfo_signing_alg_values_supported: string[];
  userinfo_encryption_alg_values_supported: string[];
  userinfo_encryption_enc_values_supported: string[];
  request_object_signing_alg_values_supported: string[];
  request_object_encryption_alg_values_supported: string[];
  request_object_encryption_enc_values_supported: string[];
  introspection_endpoint_auth_methods_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  code_challenge_methods_supported: string[];
  prompt_values_supported: string[];
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
};

type JWK = {
  kty: string;       // Key Type (e.g., "RSA")
  kid: string;       // Key ID
  use: string;       // Public Key Use (e.g., "sig" for signature)
  alg: string;       // Algorithm (e.g., "RS256")
  n: string;         // Modulus (base64url-encoded)
  e: string;         // Exponent (base64url-encoded)
};

type JWKS = {
  keys: JWK[];
};

type Endpoints = {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revokeEndpoint: string;
}
