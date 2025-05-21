import { Subject, Teacher } from "../types/Assignment";

export class Assignment {
    constructor(
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
}
