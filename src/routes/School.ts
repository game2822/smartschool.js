import { BASE_URL, SCHOOL_NEWS, SEARCH_SCHOOLS } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { Attachment } from "../structures/Attachment";
import { News } from "../structures/News";
import { School } from "../structures/School";
import { NewsAttributes } from "../types/News";
import { BaseDataResponse, BaseResponse, fileIncluded } from "../types/RequestHandler";
import { SchoolAttributes, schoolIncluded } from "../types/School";
import { getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const SearchSchools = async (query: string, limit = 10, offset = 0): Promise<Array<School>> => {
    const response = await manager.get<BaseResponse>(SEARCH_SCHOOLS(), {
        "filter[text]": query,
        "page[limit]":  limit,
        "page[offset]": offset
    });

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"school", SchoolAttributes>  => item.type === "school")
        .map(school => new School(
            school.id,
            school.attributes?.name ?? "",
            school.attributes?.emsCode ?? "",
            school.attributes?.emsOIDCWellKnownUrl ?? "",
            {
                city:        school.attributes?.city ?? "",
                country:     school.attributes?.country ?? "",
                addressLine: [
                    school.attributes?.addressLine1 ?? "",
                    school.attributes?.addressLine2 ?? "",
                    school.attributes?.addressLine3 ?? ""
                ].filter((line): line is string => line !== null).join(", "),
                zipCode: school.attributes?.zipCode ?? ""
            },
            school.attributes?.homePageUrl ?? ""
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
        .filter((item): item is BaseDataResponse<"news", NewsAttributes> => item.type === "news")
        .map(news => {
            const { relationships, attributes } = news;

            const illustrationId = getSingleRelation(relationships.illustration)?.id;
            const authorData = getSingleRelation(relationships.school);

            const illustration = illustrationId
                ? includedMap.get(`schoolInfoFile:${illustrationId}`) as fileIncluded
                : null;

            const author = authorData
                ? includedMap.get(`${authorData.type}:${authorData.id}`) as schoolIncluded
                : null;

            return new News(
                news.id,
                new Date(attributes?.publicationDateTime ?? ""),
                attributes?.title ?? "",
                attributes?.shortContent ?? "",
                attributes?.content ?? "",
                {
                    id:   authorData?.id ?? "",
                    name: author?.attributes?.name ?? ""
                },
                attributes?.linkedWebSiteUrl ?? "",
                new Attachment(accessToken, illustration?.id ?? "", illustration?.attributes?.url ?? "")
            );
        });
};
