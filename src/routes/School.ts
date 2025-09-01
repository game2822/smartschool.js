import { BASE_URL, SCHOOL_NEWS } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Attachment } from "../structures/Attachment";
import { News } from "../structures/News";
import { NewsAttributes } from "../types/News";
import { BaseDataResponse, BaseResponse, fileIncluded } from "../types/RequestHandler";
import { schoolIncluded } from "../types/School";
import { getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const GetSchoolNews = async (accessToken: string): Promise<Array<News>> => {
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
        Authorization: `Bearer ${accessToken}`
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
