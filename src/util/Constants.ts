export const OIDC_CLIENT_ID = "SkoApp.Prod.0d349217-9a4e-41ec-9af9-df9e69e09494";
export const OIDC_CLIENT_SECRET = "7cb4d9a8-2580-4041-9ae8-d5803869183f";
export const REDIRECT_URI = "skoapp-prod://sign-in-callback";

export enum Permissions {
    READ_EVALUATIONS = "READ_EVALUATIONS",
    READ_ABSENCE_FILES = "READ_ABSENCE_FILES",
    READ_MESSAGES = "READ_MESSAGES",
    WRITE_MESSAGES = "WRITE_MESSAGES"
}

export enum Services {
    MESSAGES = "MSG",
    TIMETABLE = "CDT",
    APP = "SKOAPP",
    ABSENCES = "ABS",
    ARTICLES = "ART",
    HOMEWORK = "TAF",
    EVALUATIONS = "EVAL",
    COMMUNICATION = "COMC"
}

export enum ChallengeMethod {
    PLAIN = "plain",
    S256 = "S256"
}

export enum Kind {
    STUDENT = "Eleve"
}

export enum AttendanceItemType {
    LATENESS = "LATENESS",
    ABSENCE = "ABSENCE"
}

export enum AttendanceItemState {
    LOCKED = "LOCKED",
    OPEN = "OPEN"
}
