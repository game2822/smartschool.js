import { RestManager } from "../rest/RESTManager"

export const GetOIDCWellKnown = async (url: string): Promise<OIDCProviderMetadata> => {
    const OIDCManager = new RestManager(url);
    const response = await OIDCManager.get<OIDCProviderMetadata>(url);
    if (response.jwks_uri && response.authorization_endpoint && response.token_endpoint) {
        return response;
    } else {
        throw new Error("Invalid OIDC Provider Metadata");
    }
}