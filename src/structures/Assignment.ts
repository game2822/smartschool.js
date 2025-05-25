import { Attachment } from "./Attachment";
import { Subject, Teacher } from "../types/Assignment";
import { GetAssignmentAttachments, SetAssignmentCompletion } from "../routes/Assignments";

export class Assignment {
    constructor(
        protected accessToken: string,
        public userId: string,
        public schoolId: string,
        public emsCode: string,
        public id: string,
        public done: boolean,
        public title: string,
        public html: string,
        public dueDateTime: Date,
        public deliverWorkOnline: boolean,
        public onlineDeliverUrl: string | null,
        public teacher: Teacher,
        public subject: Subject
    ) {}

    getAttachments(): Promise<Array<Attachment>> {
        return GetAssignmentAttachments(this.id, this.userId, this.schoolId, this.accessToken, this.emsCode);
    }

    setCompletion(completed?: boolean): Promise<Assignment> {
        return SetAssignmentCompletion(this.id, this.userId, completed ?? !this.done, this.schoolId, this.accessToken, this.emsCode);
    }
}
