export const OIDC_CLIENT_ID = "fc8cbe0f99af7a9e8d407ad765f41cf7";
export const OIDC_CLIENT_SECRET = "aa13da7de7e173860bb62abf8bcf99ff";
export const REDIRECT_URI = "smsc://";

export enum Permissions {
    READ_EVALUATIONS = "READ_EVALUATIONS",
    READ_ABSENCE_FILES = "READ_ABSENCE_FILES",
    READ_MESSAGES = "READ_MESSAGES",
    WRITE_MESSAGES = "WRITE_MESSAGES",
    READ_LESSONS = "READ_LESSONS",
    READ_ASSIGNMENTS = "READ_HOMEWORK_ASSIGNMENTS",
    MARK_ASSIGNMENT_AS_DONE = "MARK_HOMEWORK_ASSIGNMENT_AS_DONE"
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

export enum AttendanceItemType {
    LATENESS = "LATENESS",
    ABSENCE = "ABSENCE"
}

export enum AttendanceItemState {
    LOCKED = "LOCKED",
    OPEN = "OPEN"
}

export enum SkillLevels {
    NONE = "NONE",
    INSUFFICIENT_MASTERY = "INSUFFICIENT_MASTERY",
    LOW_MASTERY = "LOW_MASTERY",
    SATISFACTORY_MASTERY = "SATISFACTORY_MASTERY",
    VERY_GOOD_MASTERY = "VERY_GOOD_MASTERY"
}

export enum MailFolderType {
    INBOX = "INBOX",
    SENT = "SENT",
    PERSONAL = "PERSONAL",
    TRASH = "TRASH"
}

export enum Kind {
    STUDENT,
    PARENT
}
