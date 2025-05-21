import { AuthFlow } from "./OIDC";
import { GetOIDCJWKS, GetOIDCWellKnown } from "../routes/OIDC";
import { Location } from "../types/School";
import { ChallengeMethod, Services } from "../util/Constants";

export class School {
    constructor(
        /** Unique ID for each school, starting by "SKO-E-" */
        public id: string,
        /** Name of the school */
        public name: string,
        /** Type of the school, usually "school" */
        public type: "school" | string,
        /** EMS Code */
        public emsCode: string,
        /** URL to the school's OIDC well-known endpoint */
        public OIDCWellKnown: string,
        /** URL to the school's CAS homepage, don't use it to init login */
        public location: Location,
        public homepage?: string,
        public UAI?: string,
        public subscribedServices?: Array<Services>
    ){}

    async initializeLogin(challengeMethod = ChallengeMethod.S256): Promise<AuthFlow> {
        const metadata = await GetOIDCWellKnown(this.OIDCWellKnown);
        const jwks = await GetOIDCJWKS(metadata.jwks_uri);
        return new AuthFlow(
            challengeMethod,
            {
                wellKnown:             this.OIDCWellKnown,
                authorizationEndpoint: metadata.authorization_endpoint,
                tokenEndpoint:         metadata.token_endpoint,
                revokeEndpoint:        metadata.revocation_endpoint
            },
            this.id,
            jwks,
            this
        );
    }
}
