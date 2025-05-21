import { AssignementsResponseData } from "./Assignment";
import { NewsResponseData, schoolInfoAuthorIncluded, schoolInfoTechnicalUser } from "./News";
import { schoolIncluded, SchoolResponseData } from "./School";
import { UserResponseData } from "./User";

export interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    path?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

export interface BaseResponse {
    data: Array<NewsResponseData | SchoolResponseData | AssignementsResponseData> | UserResponseData;
    included: Array<nonTeachingStaffIncluded | schoolIncluded | fileIncluded | schoolInfoAuthorIncluded | schoolInfoTechnicalUser>;
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

interface RelationshipData<T extends string> {
    data: {
        id: string;
        type: T;
    };
}

export interface Relationships {
    school?: RelationshipData<"school">;
    author?: RelationshipData<"schoolInfoAuthor">;
    illustration?: RelationshipData<"schoolInfoFile">;
    teacher?: RelationshipData<"teacher">;
    subject?: RelationshipData<"subject">;
}
