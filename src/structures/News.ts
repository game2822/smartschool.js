import { Author } from "../types/News";

export class News {
    constructor(
        public id: string,
        public publicationDateTime: Date,
        public title: string,
        public shortContent: string,
        public content: string,
        public illustrationURL: string | null,
        public linkedWebSiteUrl: string | null,
        public author: Author
    ){}
}
