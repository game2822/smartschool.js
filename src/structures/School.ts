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
        public HomePage: string
    ){}
}