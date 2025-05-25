import { BaseIncluded } from "./RequestHandler";
import { Services } from "../util/Constants";

/**
 * Represents the physical location details of a school.
 */
export interface Location {
    /** City where the school is located. (e.g., 'Paris')*/
    city: string;
    /** Country where the school is located (e.g., 'France'). */
    country?: string;
    /** Full address line (e.g., '123 Avenue de la République'). */
    addressLine?: string | null;
    /** Postal or ZIP code. */
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
