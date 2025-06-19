import { AgendaAttributes } from "./Agenda";
import { HomeworkAttributes, homeworkIncluded } from "./Assignment";
import { absenceFileStateIncluded } from "./Attendance";
import { GradesAttributes, gradesIncluded, gradesServiceIncluded } from "./Grades";
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
    >
    | BaseDataResponse<"studentUserInfo", UserAttributes>
    | BaseDataResponse<"homework", HomeworkAttributes>;
    included: Array<nonTeachingStaffIncluded | schoolIncluded | fileIncluded | schoolInfoAuthorIncluded | schoolInfoTechnicalUser | absenceFileStateIncluded | homeworkIncluded | gradesIncluded | gradesServiceIncluded>;
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
    subSkillsEvaluationResults?: RelationshipData<"subSkillsEvaluationResults">;
}
