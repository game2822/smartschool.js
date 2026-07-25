import { BaseIncluded } from "./RequestHandler";

export interface Author {
    id: string;
    name: string;
}

export type schoolInfoTechnicalUser = BaseIncluded<"schoolInfoTechnicalUser", {
    label: string;
    logoUrl: string;
}>;

export type schoolInfoAuthorIncluded = BaseIncluded<
"schoolInfoAuthor",
undefined,
{
    technicalUser: {
        data: {
            id: string;
            type: "schoolInfoTechnicalUser";
        };
    };
}
>;

export interface NewsAttributes {
    title: string;
    publicationDateTime: string;
    shortContent: string;
    content: string;
    linkedWebSiteUrl: string | null;
}

export interface SchoolNewsRequestMetrics {
    httpMs: number;
    parseMs: number;
    mapMs: number;
    responseBytes: number;
    itemCount: number;
}
interface RawSchoolNewsItem {
    icon?: string;
    newsItem?: {
        author?: string;
        date_published?: string;
        message?: string;
        name?: string;
        newsID?: string;
        shortContent?: string;
        title?: string;
    };
}
