import { BaseIncluded, Relationships } from "./RequestHandler";

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


export interface NewsResponseData {
    id: string;
    relationships: Relationships;
    type: "news";
    attributes: NewsAttributes;
}

export interface NewsAttributes {
    title: string;
    publicationDateTime: string;
    shortContent: string;
    content: string;
    linkedWebSiteUrl: string | null;
}
