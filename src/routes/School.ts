import { SCHOOL_NEWS } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Attachment } from "../structures/Attachment";
import { News } from "../structures/News";
import { SchoolNewsRequestMetrics, RawSchoolNewsItem } from "../types/News";
import { extractBaseUrl } from "../util/URL";


export interface GetSchoolNewsOptions {
    debug?: boolean | ((metrics: SchoolNewsRequestMetrics) => void);
    stripEmbeddedImages?: boolean;
}

const stripEmbeddedImages = (html: string): string => html.replaceAll(/src=["']data:image\/[^"']+["']/g, "src=\"\"");

export const GetSchoolNews = async (
    url: string,
    accessToken: string,
    mobileId: string,
    options: GetSchoolNewsOptions = {}
): Promise<Array<News>> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);

    const requestStart = Date.now();
    const responsetext = await manager.post<string>(
        SCHOOL_NEWS(),
        undefined,
        undefined,
        {
            headers: {
                "Authorization":   `Bearer ${accessToken}`,
                "Accept-Language": "fr",
                "SmscMobileId":    mobileId
            }
        },
        true
    );
    const httpMs = Date.now() - requestStart;

    const parseStart = Date.now();
    const response: unknown = JSON.parse(responsetext);
    const parseMs = Date.now() - parseStart;

    const mapStart = Date.now();
    const rawNewsItems = (Array.isArray(response) ? response : []) as Array<RawSchoolNewsItem>;
    const newsItems = rawNewsItems
        .map(news => {
            const rawMessage = news.newsItem?.message ?? "";
            const content = options.stripEmbeddedImages ? stripEmbeddedImages(rawMessage) : rawMessage;

            const icon = news.icon ?? "";

            return new News(
                news.newsItem?.newsID ?? "",
                new Date(news.newsItem?.date_published ?? ""),
                news.newsItem?.title ?? "",
                news.newsItem?.shortContent ?? news.newsItem?.title ?? "",
                content,
                {
                    id:   news.newsItem?.author ?? "",
                    name: news.newsItem?.name ?? ""
                },
                null,
                new Attachment(accessToken, icon, `${base}/smsc/svg/${icon}/${icon}_24x24.svg`)
            );
        });
    const mapMs = Date.now() - mapStart;

    const metrics: SchoolNewsRequestMetrics = {
        httpMs,
        parseMs,
        mapMs,
        responseBytes: Buffer.byteLength(responsetext, "utf8"),
        itemCount:     newsItems.length
    };

    if (options.debug === true) {
        console.log("Smartschool news request metrics:", metrics);
    } else if (typeof options.debug === "function") {
        options.debug(metrics);
    }

    return newsItems;
};
