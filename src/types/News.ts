import { Included, Relationships } from "./RequestHandler";

export interface Author {
    id: string;
    name: string;
}

export interface schoolInfoTechnicalUser extends Included {
    attributes: {
        label: string;
        logoUrl: string;
    };
}

export interface schoolInfoAuthorIncluded extends Included {
    relationships: {
        technicalUser: {
            data: {
                id: string;
                type: "schoolInfoTechnicalUser";
            };
        };
    };
}

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
