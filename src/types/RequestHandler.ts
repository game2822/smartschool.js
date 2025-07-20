import { AgendaAttributes } from "./Agenda";
import { HomeworkAttributes, homeworkIncluded } from "./Assignment";
import { absenceFileStateIncluded } from "./Attendance";
import {
    gradeResultIncluded,
    GradesAttributes,
    gradesIncluded,
    GradesServiceAttribute,
    gradesServiceIncluded,
    GradesSettings,
    skillColorsIncluded,
    skillsIncluded
} from "./Grades";
import {
    CommunicationAttributes,
    folderIncluded,
    ParticipationAttributes,
    participationIncluded,
    personParticipantIncluded,
    signatureIncluded,
    userMailSettingAttributes
} from "./Mail";
import { NewsAttributes, schoolInfoAuthorIncluded, schoolInfoTechnicalUser } from "./News";
import { SchoolAttributes, schoolIncluded } from "./School";
import { UserAttributes } from "./User";

export interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

export interface BaseResponse {
    data:
    | Array<
    | BaseDataResponse<"news", NewsAttributes>
    | BaseDataResponse<"school", SchoolAttributes>
    | BaseDataResponse<"homework", HomeworkAttributes>
    | BaseDataResponse<"absenceFile">
    | BaseDataResponse<"agenda", AgendaAttributes>
    | BaseDataResponse<"evaluationResult", GradesAttributes>
    | BaseDataResponse<"evaluationsSetting", GradesSettings>
    | BaseDataResponse<"evaluationService", GradesServiceAttribute>
    | BaseDataResponse<"communication", CommunicationAttributes>
    | BaseDataResponse<"participation", ParticipationAttributes>
    >
    | BaseDataResponse<"studentUserInfo", UserAttributes>
    | BaseDataResponse<"homework", HomeworkAttributes>
    | BaseDataResponse<"userMailSetting", userMailSettingAttributes>;
    included: Array<nonTeachingStaffIncluded | schoolIncluded | fileIncluded | schoolInfoAuthorIncluded | schoolInfoTechnicalUser | absenceFileStateIncluded | homeworkIncluded | gradesIncluded | gradesServiceIncluded | skillColorsIncluded | skillsIncluded | gradeResultIncluded | participationIncluded | personParticipantIncluded | signatureIncluded | folderIncluded>;
}

export interface BaseDataResponse<
    T extends string,
    A = unknown
> {
    id: string;
    type: T;
    relationships: Relationships;
    attributes?: A;
}

export interface BaseIncluded<
    T extends string,
    A = unknown,
    R = unknown
> {
    id: string;
    type: T;
    attributes?: A;
    relationships?: R;
}


export type nonTeachingStaffIncluded = BaseIncluded<"nonTeachingStaff", {
    firstName: string;
    lastName: string;
    title: string;
    photoUrl: string | null;
}>;

export type fileIncluded = BaseIncluded<"schoolInfoFile", {
    url: string;
    alternativeText: string;
}>;

export interface RelationshipData<T extends string> {
    data:
    | { id: string; type: T; }
    | Array<{ id: string; type: T; }>;
}

export interface Relationships {
    school?: RelationshipData<"school">;
    author?: RelationshipData<"schoolInfoAuthor">;
    illustration?: RelationshipData<"schoolInfoFile">;
    teacher?: RelationshipData<"teacher">;
    subject?: RelationshipData<"subject">;
    currentState?: RelationshipData<"absenceFileState">;
    homeworkAssignments?: RelationshipData<"absenceFileState">;
    lessons?: RelationshipData<"lesson">;
    evaluation?: RelationshipData<"evaluation">;
    evaluations?: RelationshipData<"evaluation">;
    subSkillsEvaluationResults?: RelationshipData<"subSkillsEvaluationResults">;
    periods?: RelationshipData<"periods">;
    skillsSetting?: RelationshipData<"skillsSetting">;
    evaluationService?: RelationshipData<"evaluationService">;
    teachers?: RelationshipData<"teacher">;
    folders?: RelationshipData<"folder">;
    signature?: RelationshipData<"signature">;
    lastParticipation?: RelationshipData<"participation">;
    attachments?: RelationshipData<"attachments">;
    sender?: RelationshipData<"sender">;
    contacts?: RelationshipData<"personContact" | "groupContact">;
}
