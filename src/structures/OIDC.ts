import { Endpoints, JWKS } from "../types/OIDC";
import { ChallengeMethod, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET } from "../util/Constants";
import { base64url } from "@scure/base";
import { sha256 } from '@noble/hashes/sha2.js';

export class AuthFlow {
    private verifier = crypto.randomUUID();
    private state = crypto.randomUUID();
    private challenge: string;
    loginURL: string;

    constructor(
        public challengeMethod: ChallengeMethod,
        public endpoints: Endpoints,
        public redirectURI: string,
        public schoolId: string,
        public jwks: JWKS
    ){
        this.challenge = this.challengeMethod === ChallengeMethod.S256
            ? base64url.encode(sha256.create().update(this.verifier).digest())
            : this.verifier;

        const params = new URLSearchParams({
            client_id:             OIDC_CLIENT_ID,
            client_secret:         OIDC_CLIENT_SECRET,
            code_challenge:        this.challenge,
            code_challenge_method: this.challengeMethod,
            response_type:         "code",
            scope:                 "openid",
            schoolId:              this.schoolId,
            state:                 this.state
        });

        this.loginURL = `${this.endpoints.authorizationEndpoint}?${params.toString()}&redirect_uri=${this.redirectURI}`;
    }
}
