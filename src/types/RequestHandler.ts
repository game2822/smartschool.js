import { Permissions, Services } from "../util/Constants";
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
    data: Array<NewsResponseData | SchoolResponseData> | UserResponseData;
    included: Array<nonTeachingStaffIncluded | schoolIncluded | fileIncluded | schoolInfoAuthorIncluded | schoolInfoTechnicalUser>;
}

export interface Included {
    id: string;
    type: "nonTeachingStaff" | "school" | "schoolInfoFile" | "schoolInfoAuthor" | "schoolInfoTechnicalUser";
}

export interface nonTeachingStaffIncluded extends Included {
    attributes: {
        firstName: string;
        lastName: string;
        title: string;
        photoUrl: string | null;
    };
}

export interface fileIncluded extends Included {
    attributes: {
        url: string;
        alternativeText: string;
    };
}

export interface Relationships {
    school?: {
        data: {
            id: string;
            type: "school";
        };
    };
    author?: {
        data: {
            id: string;
            type: string;
        };
    };
    illustration?: {
        data: {
            id: string;
            type: string;
        };
    };
}
