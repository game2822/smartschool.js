export interface RawSchoolSearchResponse {
    data: Array<RawSchool>;
    links: {
        first: string;
        last: string;
    };
    meta: {
        totalResourceCount: number;
    };
}

interface RawSchool {
    id: string;
    type: string;
    attributes: {
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
    };
}

export interface Location {
    city: string;
    country: string;
    addressLine: string | null;
    zipCode: string;
}
