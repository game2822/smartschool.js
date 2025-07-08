import { Message } from "./Message";
import { GetMessagesFromMail } from "../routes/Mail";
import { Author } from "../types/News";

export class Mail {
    constructor(
        private emsCode: string,
        private accessToken: string,
        public id: string,
        public subject: string,
        public messages: number,
        public participants: Array<string>,
        public read: boolean,
        public replyToAllAllowed: boolean,
        public replyToSenderAllowed: boolean,
        public readTrackingEnabled: boolean,
        public date: Date,
        public content: string,
        public sender: Author
    ){}

    async getMessages(): Promise<Array<Message>> {
        return GetMessagesFromMail(this.id, this.emsCode, this.accessToken);
    }
}
