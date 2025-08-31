import { Verify } from "crypto";
import { BASE_URL, InstanceValidation, OIDC_TOKEN_PATH } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { JWKS, OIDCAccessToken, OIDCProviderMetadata } from "../types/OIDC";
import { OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, REDIRECT_URI } from "../util/Constants";
import { extractBaseUrl } from "../util/URL";
import { RegisterDevice } from "./User";
import { SmartSchool } from "../structures/Smartschool";
import { generateRandomCode } from "../util/Verifier";
import { base64url } from "@scure/base";
import { sha256 } from "@noble/hashes/sha2.js";

const verifier = generateRandomCode();


const generateChallenge = (verifier: string): string => {
        return base64url.encode(sha256.create().update(verifier).digest()).slice(0, -1);
    };
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

export const getSmartschoolLoginUrl = async (baseURL: string): Promise<string> => {
    const params = new URLSearchParams({
        client_id:             OIDC_CLIENT_ID,
        response_type:         "code",
        scope:                 "mobile",
        code_challenge_method: "S256",
        code_challenge:        await generateChallenge(verifier),
        redirect_uri:          REDIRECT_URI
    });

    return `${baseURL}/OAuth/mobile?${params.toString()}`;
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

export const GetOIDCAccessTokens = async (url: string, code: string, codeVerifier: string): Promise<OIDCAccessToken> => {
    const manager = new RestManager(url);
    const body = new URLSearchParams({
        client_id:     OIDC_CLIENT_ID,
        client_secret: OIDC_CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    "authorization_code",
        code,
        code_verifier: codeVerifier,
        scope:         "mobile"
    }).toString();

    return manager.post<OIDCAccessToken>(
        OIDC_TOKEN_PATH(),
        body,
        undefined,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
};

export const isValidInstance = async (url: string): Promise<boolean> => {
    try {
        const base = url
        const manager = new RestManager(base);
        const response = await manager.get(InstanceValidation());
        if (typeof response === 'object' && response !== null && 'isValid' in response) {
            return response.isValid === true;
        }
        return false;
    } catch (error) {
        return false;
    }
}


export const finalizeLogin = async (
    url: string,
    code: string,
    deviceType: string,
    deviceName: string,
    deviceId: string
): Promise<SmartSchool> => {
    const tokens = await GetOIDCAccessTokens(
        url,
        code,
        verifier
    );

    return RegisterDevice(
        tokens.access_token,
        tokens.refresh_token,
        url,
        deviceType,
        deviceName,
        deviceId
    );
};

export const OIDCRefresh = async (url: string, refreshToken: string): Promise<OIDCAccessToken> => {
    const tokenUrl = url + OIDC_TOKEN_PATH;
    const [base, path] = extractBaseUrl(tokenUrl);
    const manager = new RestManager(base);
    const body = new URLSearchParams({
        grant_type:    "refresh_token",
        refresh_token: refreshToken,
        client_id:     OIDC_CLIENT_ID,
        client_secret: OIDC_CLIENT_SECRET
    }).toString();

    return manager.post<OIDCAccessToken>(
        path,
        body,
        undefined,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
};
