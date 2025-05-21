import { BaseIncluded } from "./RequestHandler";
import { Services } from "../util/Constants";

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

export type schoolIncluded = BaseIncluded<"school", {
    name: string;
    city?: string;
    timeZone: string;
    subscribedServices: Array<Services>;
    administrativeId: string;
    schoolAudience: SchoolAudience;
}>;


export interface SchoolAudience {
    enabled: boolean;
    audienceId: string;
    projectId: string;
}
