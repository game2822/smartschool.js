import { GetOIDCJWKS, GetOIDCWellKnown } from "../routes/OIDC";
import { ChallengeMethod } from "../util/Constants";
import { AuthFlow } from "./OIDC";

export class School {
    constructor(
        /** Unique ID for each school, starting by "SKO-E-" */
        public id: string,
        /** Name of the school */
        public name: string,
        /** Type of the school, usually "school" */
        public type: "school" | string,
        /** URL to the school's OIDC well-known endpoint */
        public OIDCWellKnown: string,
        /** URL to the school's CAS homepage, don't use it to init login */
        public homepage: string
    ){}

    public async initializeLogin(challengeMethod = ChallengeMethod.S256, redirectURL = "skoapp-prod://sign-in-callback"): Promise<AuthFlow> {
        const metadata = await GetOIDCWellKnown(this.OIDCWellKnown);
        const jwks = await GetOIDCJWKS(metadata.jwks_uri);
        return new AuthFlow(
            challengeMethod,
            {
                authorizationEndpoint: metadata.authorization_endpoint,
                tokenEndpoint: metadata.token_endpoint,
                revokeEndpoint: metadata.revocation_endpoint
            },
            redirectURL,
            this.id,
            jwks
        );
    }
}