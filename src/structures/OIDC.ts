import { Skolengo } from "./Skolengo";
import { School } from "./School";
import { Endpoints, JWKS } from "../types/OIDC";
import { ChallengeMethod, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, REDIRECT_URI } from "../util/Constants";
import { GetOIDCAccessTokens } from "../routes/OIDC";
import { generateRandomCode } from "../util/Verifier";
import { GetUserInfo } from "../routes/User";
import { sha256 } from "@noble/hashes/sha2.js";
import { base64url } from "@scure/base";

export class AuthFlow {
    private verifier = generateRandomCode();
    private state = generateRandomCode();
    private challenge: string;
    loginURL: string;

    constructor(
        public challengeMethod: ChallengeMethod,
        public endpoints: Endpoints,
        public schoolId: string,
        public jwks: JWKS,
        public school: School
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

    async finalizeLogin(code: string, state: string): Promise<Skolengo> {
        if (decodeURIComponent(state) !== this.state) {
            throw new Error("The state does not match the one we generated");
        }
        const tokens = await GetOIDCAccessTokens(this.endpoints.tokenEndpoint, code, this.verifier);
        return GetUserInfo(tokens.access_token, tokens.refresh_token, this.endpoints.wellKnown, this.school.emsCode);
    }
}
