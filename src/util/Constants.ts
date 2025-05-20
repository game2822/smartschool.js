export const OIDC_CLIENT_ID = "SkoApp.Prod.0d349217-9a4e-41ec-9af9-df9e69e09494";
export const OIDC_CLIENT_SECRET = "7cb4d9a8-2580-4041-9ae8-d5803869183f";
export const REDIRECT_URI = "skoapp-prod://sign-in-callback";

export enum Permission {
    READ_EVALUATIONS = "READ_EVALUATIONS",
    READ_ABSENCE_FILES = "READ_ABSENCE_FILES",
    READ_MESSAGES = "READ_MESSAGES",
    WRITE_MESSAGES = "WRITE_MESSAGES"
}

export enum ChallengeMethod {
    PLAIN = "plain",
    S256 = "S256"
}
