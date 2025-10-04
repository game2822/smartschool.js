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

export const ATTENDANCE_CODE_MAP: Record<string, AttendanceItemType> = {
    '215-50': AttendanceItemType.LATENESS, // Retards Justifiées
    '215-52': AttendanceItemType.LATENESS, // Retards Non Justifiées
    '223': AttendanceItemType.ABSENCE, // Certificat Médical
    '219': AttendanceItemType.ABSENCE,  
    '221': AttendanceItemType.ABSENCE,
    '225': AttendanceItemType.ABSENCE,
    '315': AttendanceItemType.ABSENCE,
    '241': AttendanceItemType.ABSENCE
};

// Add a separate mapping for states
export const ATTENDANCE_STATE_MAP: Record<string, AttendanceItemState> = {
    '215-50': AttendanceItemState.LOCKED, // Retards Justifiées 
    '215-52': AttendanceItemState.OPEN,   // Retards Non Justifiées
    '223': AttendanceItemState.LOCKED,      // Default to locked for medical certificates
    '219': AttendanceItemState.OPEN,        // Absence injustifiée
    '221': AttendanceItemState.LOCKED,      // Justificatif des parents
    '225': AttendanceItemState.LOCKED,      // Justifiée par le directeur
    '315': AttendanceItemState.LOCKED,      // Autorisée par l'Administration
    '241': AttendanceItemState.LOCKED       // Exclusion temporaire
};
export enum SkillLevels {
    NONE = "NONE",
    INSUFFICIENT_MASTERY = "INSUFFICIENT_MASTERY",
    LOW_MASTERY = "LOW_MASTERY",
    SATISFACTORY_MASTERY = "SATISFACTORY_MASTERY",
    VERY_GOOD_MASTERY = "VERY_GOOD_MASTERY"
}

export enum MailFolderType {
    TRASH = "TRASH",
    SENT = "SENT",
    PERSONAL = "PERSONAL",
    INBOX = "INBOX"
}

export enum Kind {
    PARENT,
    STUDENT
}
