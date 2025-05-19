import { RestManager } from "../rest/RESTManager"
import { extractBaseUrl } from "../util/URL";

export const GetOIDCWellKnown = async (url: string): Promise<OIDCProviderMetadata> => {
    const [base, path] = extractBaseUrl(url);
    const manager = new RestManager(base);
    const response = await manager.get<OIDCProviderMetadata>(path);

    if (
        response.jwks_uri &&
        response.authorization_endpoint &&
        response.token_endpoint
    ) {
        return response;
    }

    throw new Error("Invalid OIDC Provider Metadata");
};

export const GetOIDCJWKS = async (url: string): Promise<JWKS> => {
    const [base, path] = extractBaseUrl(url);
    const manager = new RestManager(base);
    const response = await manager.get<JWKS>(path);

    if (Array.isArray(response.keys)) {
        return response;
    }

    throw new Error("Invalid JWK");
};