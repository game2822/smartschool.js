import { downloadAttachment } from "../routes/Attachments";

export class Attachment {
    constructor(
        protected accessToken: string,
        public id: string,
        public fileName: string,
        public type: string,
        public typeLabel: string,
        public size: number,
        public url: string
    ){}

    download(): Promise<Buffer> {
        return downloadAttachment(this.url, this.accessToken);
    }
}
