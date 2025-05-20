import { Endpoints, JWKS, OIDCAccessToken } from "../types/OIDC";
import { ChallengeMethod, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, REDIRECT_URI } from "../util/Constants";
import { base64url } from "@scure/base";
import { sha256 } from '@noble/hashes/sha2.js';
import { GetOIDCAccessTokens } from "../routes/OIDC";
import { generateCodeVerifier } from "../util/Verifier";

export class AuthFlow {
    private verifier = generateCodeVerifier();
    private state = generateCodeVerifier();
    private challenge: string;
    loginURL: string;

    constructor(
        public challengeMethod: ChallengeMethod,
        public endpoints: Endpoints,
        public schoolId: string,
        public jwks: JWKS
    ){
        this.challenge = this.challengeMethod === ChallengeMethod.S256
            ? base64url.encode(sha256.create().update(this.verifier).digest()).slice(0, -1)
            : this.verifier;

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

        this.loginURL = `${this.endpoints.authorizationEndpoint}?${params.toString()}`;
    }

    public async finalizeLogin(code: string): Promise<OIDCAccessToken> {
        return GetOIDCAccessTokens(this.endpoints.tokenEndpoint, code, this.verifier);
    }
}