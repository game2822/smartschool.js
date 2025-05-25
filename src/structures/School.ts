import { AuthFlow } from "./OIDC";
import { GetOIDCJWKS, GetOIDCWellKnown } from "../routes/OIDC";
import { Location } from "../types/School";
import { ChallengeMethod, Services } from "../util/Constants";

/**
 * Represents a school entity with identity, location, and authentication details.
 */
export class School {
    /**
     * @param id - Unique ID for each school, starting with "SKO-E-".
     * @param name - Display name of the school.
     * @param type - Entity type, usually "school".
     * @param emsCode - EMS code used for internal identification.
     * @param OIDCWellKnown - URL to the school's OIDC `.well-known` configuration.
     * @param location - Geographical and postal location of the school.
     * @param homepage - Optional CAS homepage (not for login initiation).
     * @param UAI - Administrative identifier (Unité Administrative Immatriculée).
     * @param subscribedServices - List of services the school is subscribed to.
     */
    constructor(
        public id: string,
        public name: string,
        public type: "school" | string,
        public emsCode: string,
        public OIDCWellKnown: string,
        public location: Location,
        public homepage?: string,
        public UAI?: string,
        public subscribedServices?: Array<Services>
    ) {}

    /**
     * Initializes the OIDC authentication flow for this school.
     * @param challengeMethod - PKCE challenge method to use (default: S256).
     * @returns An initialized AuthFlow ready to start the login process.
     */
    async initializeLogin(challengeMethod: ChallengeMethod = ChallengeMethod.S256): Promise<AuthFlow> {
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
