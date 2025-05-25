import { downloadAttachment } from "../routes/Attachments";
import { Author } from "../types/News";

/**
 * Represents a news article or announcement.
 */
export class News {
    /**
     * @param id - Unique identifier for the news article.
     * @param publicationDateTime - The publication date and time.
     * @param title - Title of the news.
     * @param shortContent - Short preview of the content (summary or excerpt).
     * @param content - Full content of the news.
     * @param author - Author who created or published the news.
     * @param illustrationURL - Optional image or media URL for illustration.
     * @param linkedWebSiteUrl - Optional external website URL related to the news.
     */
    constructor(
        public id: string,
        public publicationDateTime: Date,
        public title: string,
        public shortContent: string,
        public content: string,
        public author: Author,
        public illustrationURL?: string,
        public linkedWebSiteUrl?: string
    ) {}

    fetchIllustrationBuffer(): Promise<Buffer> {
        if (!this.illustrationURL) {
            throw new Error("This news doesn't have an illustration.");
        }
        return downloadAttachment(this.illustrationURL);
    }
}
