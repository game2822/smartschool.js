import { BASE_URL, SCHOOL_NEWS } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Attachment } from "../structures/Attachment";
import { News } from "../structures/News";
import { NewsAttributes } from "../types/News";
import { BaseDataResponse, BaseResponse, fileIncluded } from "../types/RequestHandler";
import { schoolIncluded } from "../types/School";
import { getSingleRelation } from "../util/Relations";
import { extractBaseUrl } from "../util/URL";


export const GetSchoolNews = async (url: string, accessToken: string, mobileId: string): Promise<Array<News>> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);

    const responsetext = await manager.post<any>(SCHOOL_NEWS(),
    undefined,
    undefined,
     {
        headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept-Language": "fr",
                "SmscMobileId": mobileId
            }
    },
    true
);
    const response = JSON.parse(responsetext);

    return (Array.isArray(response) ? response : [])
        .map(news => {
            return new News(
                news.newsItem.newsID,
                new Date(news.newsItem.date_published ?? ""),
                news.newsItem.title ?? "",
                news.newsItem.message ?? "",
                news.newsItem.message ?? "",
                {
                    id:   news.newsItem.author ?? "",
                    name: news.newsItem.name ?? ""
                },
                "",
                new Attachment(accessToken, news.icon ?? "", `${base}/smsc/svg/${news.icon}/${news.icon}_24x24.svg`)
            );
        });
};
