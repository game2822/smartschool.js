import { Mail } from "./Mail";
import { MailFolderType } from "../util/Constants";

export class MailFolder {
    constructor(
        public id: string,
        public name: string,
        public position: number,
        public type: MailFolderType,
        public mails?: Array<Mail>
    ){}
}
