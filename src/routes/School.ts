import { BASE_URL, SCHOOL_NEWS, SEARCH_SCHOOLS } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { News } from "../structures/News";
import { School } from "../structures/School";
import { NewsResponseData } from "../types/News";
import { BaseResponse, fileIncluded } from "../types/RequestHandler";
import { schoolIncluded, SchoolResponseData } from "../types/School";

const manager = new RestManager(BASE_URL());

export const SearchSchools = async (query: string, limit = 10, offset = 0): Promise<Array<School>> => {
    const response = await manager.get<BaseResponse>(SEARCH_SCHOOLS(), {
        "filter[text]": query,
        "page[limit]":  limit,
        "page[offset]": offset
    });

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is SchoolResponseData => item.type === "school")
        .map(school => new School(
            school.id,
            school.attributes.name,
            school.type,
            school.attributes.emsCode,
            school.attributes.emsOIDCWellKnownUrl,
            {
                city:        school.attributes.city,
                country:     school.attributes.country,
                addressLine: [
                    school.attributes.addressLine1,
                    school.attributes.addressLine2,
                    school.attributes.addressLine3
                ].filter((line): line is string => line !== null).join(", "),
                zipCode: school.attributes.zipCode
            },
            school.attributes.homePageUrl
        ));
};

export const GetSchoolNews = async (accessToken: string, emsCode: string): Promise<Array<News>> => {
    const response = await manager.get<BaseResponse>(SCHOOL_NEWS(), {
        "include":                         "illustration,school,author,author.person,author.technicalUser",
        "fields[schoolInfo]":              "illustration,school,author,publicationDateTime,title,shortContent,content,linkedWebSiteUrl",
        "fields[announcement]":            "level",
        "fields[schoolInfoFile]":          "url,alternativeText",
        "fields[school]":                  "name",
        "fields[schoolInfoAuthor]":        "person,technicalUser,additionalInfo",
        "fields[person]":                  "firstName,lastName,title,photoUrl",
        "fields[schoolInfoTechnicalUser]": "label,logoUrl",
        "page[limit]":                     50
    }, {
        "Authorization":       `Bearer ${accessToken}`,
        "x-skolengo-ems-code": emsCode
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is NewsResponseData => item.type === "news")
        .map(news => {
            const { relationships, attributes } = news;

            const illustrationId = relationships.illustration?.data?.id;
            const authorData = relationships.school?.data;

            const illustration = illustrationId
                ? includedMap.get(`schoolInfoFile:${illustrationId}`) as fileIncluded
                : null;

            const author = authorData
                ? includedMap.get(`${authorData.type}:${authorData.id}`) as schoolIncluded
                : null;

            return new News(
                news.id,
                new Date(attributes.publicationDateTime),
                attributes.title,
                attributes.shortContent,
                attributes.content,
                illustration?.attributes?.url ?? null,
                attributes.linkedWebSiteUrl,
                {
                    id:   authorData?.id ?? "",
                    name: author?.attributes?.name ?? ""
                }
            );
        });
};
