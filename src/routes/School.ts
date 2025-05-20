import { BASE_URL, SEARCH_SCHOOLS } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { School } from "../structures/School";
import { RawSchoolSearchResponse } from "../types/School";

const manager = new RestManager(BASE_URL());

export const SearchSchools = async (query: string, limit = 10, offset = 0): Promise<Array<School>> => {
    const response = await manager.get<RawSchoolSearchResponse>(SEARCH_SCHOOLS(), {
        "filter[text]": query,
        "page[limit]":  limit,
        "page[offset]": offset
    });

    return response.data.map(school => new School(
        school.id,
        school.attributes.name,
        school.type,
        school.attributes.emsOIDCWellKnownUrl,
        {
            city:        school.attributes.city,
            country:     school.attributes.country,
            addressLine: [
                school.attributes.addressLine1,
                school.attributes.addressLine2,
                school.attributes.addressLine3
            ].filter(line => line !== null).join(", "),
            zipCode: school.attributes.zipCode
        },
        school.attributes.homePageUrl
    ));
};

export const GetSchoolActualities = async (): Promise<Array<string>> => {
    console.log("Not implemented yet");
    return [];
};
