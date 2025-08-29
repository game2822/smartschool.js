import { Message } from "./Message";
import { GetMessagesFromMail } from "../routes/Mail";
import { Author } from "../types/News";

export class Mail {
    constructor(
        private accessToken: string,
        public id: string,
        public subject: string,
        public messages: number,
        public participants: Array<string>,
        public read: boolean,
        public date: Date,
        public content: string,
        public sender?: Author,
        public replyToAllAllowed?: boolean,
        public replyToSenderAllowed?: boolean,
        public readTrackingEnabled?: boolean
    ){}

    async getMessages(): Promise<Array<Message>> {
        return GetMessagesFromMail(this.id, this.accessToken);
    }
}
