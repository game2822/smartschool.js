import { Services } from "../util/Constants";
import { Included } from "./RequestHandler";

export interface Location {
    city: string;
    country?: string;
    addressLine?: string | null;
    zipCode?: string;
}

export interface SchoolResponseData {
    id: string;
    type: "school";
    attributes: SchoolAttributes;
}

export interface SchoolAttributes {
    homePageUrl: string;
    city: string;
    country: string;
    addressLine1: string | null;
    addressLine2: string | null;
    addressLine3: string | null;
    emsCode: string;
    emsOIDCWellKnownUrl: string;
    name: string;
    zipCode: string;
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
