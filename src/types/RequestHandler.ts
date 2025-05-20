import { Permissions, Services } from "../util/Constants";

export interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    path?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

export interface BaseResponse {
    data: Array<NewsResponseData> | UserResponseData;
    included: Array<nonTeachingStaffIncluded | schoolIncluded | fileIncluded>;
}

export interface UserResponseData {
    id: string;
    relationships: Relationships;
    type: "studentUserInfo";
    attributes: UserAttributes;
}

export interface NewsResponseData {
    id: string;
    relationships: Relationships;
    type: "news";
    attributes: NewsAttributes;
}

export interface UserAttributes {
    regime: string;
    audienceId: string;
    firstName: string;
    lastName: string;
    className: string;
    dateOfBirth: string;
    externalMail: string;
    photoUrl: string | null;
    mobilePhone: string;
    permissions: Array<Permission>;
}

export interface Permission {
    service: string;
    schoolId: string;
    permittedOperations: Array<Permissions>;
}

export interface Included {
    id: string;
    type: "nonTeachingStaff";
}

export interface nonTeachingStaffIncluded extends Included {
    attributes: {
        firstName: string;
        lastName: string;
        title: string;
        photoUrl: string | null;
    };
}

export interface schoolIncluded extends Included {
    attributes: {
        name: string;
        city?: string;
        timeZone: string;
        subscribedServices: Array<Services>;
        administrativeId: string;
        schoolAudience: SchoolAudience;
    };
}

export interface SchoolAudience {
    enabled: boolean;
    audienceId: string;
    projectId: string;
}

export interface fileIncluded extends Included {
    attributes: {
        url: string;
        alternativeText: string;
    };
}

export interface NewsAttributes {
    title: string;
    publicationDateTime: string;
    shortContent: string;
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
