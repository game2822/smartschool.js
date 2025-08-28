import { School } from "./School";
import { SmartSchool } from "./Smartschool";
import { Endpoints, JWKS } from "../types/OIDC";
import { ChallengeMethod, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, REDIRECT_URI } from "../util/Constants";
import { generateRandomCode } from "../util/Verifier";
import { GetOIDCAccessTokens } from "../routes/OIDC";
import { GetUserInfo } from "../routes/User";
import { sha256 } from "@noble/hashes/sha2.js";
import { base64url } from "@scure/base";


/**
 * Handles the OpenID Connect authentication flow for a given school.
 */
export class AuthFlow {
    /* Randomly generated verifier used for PKCE (Proof Key for Code Exchange) */
    private verifier = generateRandomCode();
    /* Randomly generated state to protect against CSRF attacks */
    private state = generateRandomCode();
    private challenge: string;

    /**
     * Constructs a new instance of the AuthFlow.
     * @param challengeMethod - The PKCE challenge method (e.g., 'S256' or 'plain'), SHA256 is recommended for security purpose.
     * @param endpoints - The OIDC endpoints (authorization, token, well-known).
     * @param schoolId - The unique identifier for the school (Provided by Skolengo).
     * @param jwks - The JSON Web Key Set used to validate OIDC tokens.
     * @param school - The School object with metadata such as EMS code.
     */
    constructor(
        public challengeMethod: ChallengeMethod,
        public endpoints: Endpoints,
        public schoolId: string,
        public jwks: JWKS,
        public school: School
    ){
        this.challenge = this.generateChallenge(this.verifier, this.challengeMethod);
    }

    /**
     * Generates a PKCE code challenge based on the provided method.
     * @param verifier - The random verifier string.
     * @param method - The challenge method (S256 or plain).
     * @returns The resulting challenge string.
     */
    private generateChallenge(verifier: string, method: ChallengeMethod): string {
        if (method === ChallengeMethod.S256) {
            return base64url.encode(sha256.create().update(verifier).digest()).slice(0, -1);
        }
        return verifier;
    }

    /**
     * Returns the login URL that the user should be redirected to in order to authenticate.
     */
    get loginURL(): string {
        const params = new URLSearchParams({
            client_id:             OIDC_CLIENT_ID,
            client_secret:         OIDC_CLIENT_SECRET,
            code_challenge:        this.challenge,
            code_challenge_method: this.challengeMethod,
            response_type:         "code",
            scope:                 "openid",
            schoolId:              this.schoolId,
            state:                 this.state,
            redirect_uri:          REDIRECT_URI
        });

        const url = new URL(this.endpoints.authorizationEndpoint);
        url.search = params.toString();
        return url.toString();
    }

    /**
     * Finalizes the login process by exchanging the code for tokens
     * and retrieving user information.
     * @param code - The authorization code received from the provider.
     * @param state - The state returned from the provider (must match the one we generated).
     * @returns A promise resolving to the authenticated Skolengo user.
     */
    async finalizeLogin(code: string, state: string): Promise<SmartSchool> {
        const decodedState = decodeURIComponent(state);
        if (decodedState !== this.state) {
            throw new Error(`Invalid state: received "${decodedState}", expected "${this.state}"`);
        }

        const tokens = await GetOIDCAccessTokens(
            this.endpoints.tokenEndpoint,
            code
        );

        return GetUserInfo(
            tokens.access_token,
            tokens.refresh_token,
            this.endpoints.wellKnown,
            this.endpoints.tokenEndpoint,
            this.school.emsCode
        );
    }
}
