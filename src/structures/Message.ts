import { Attachment } from "./Attachment";
import { Author } from "../types/News";

export class Message {
    constructor(
        public id: string,
        public date: Date,
        public content: string,
        public read: boolean,
        public attachments: Array<Attachment>,
        public author: Author
    ){}
}
