import { Subject, Teacher } from "../types/Assignment";

export class Lesson {
    constructor(
        public id: string,
        public startDateTime: Date,
        public endDateTime: Date,
        public room: string,
        public canceled: boolean,
        public hasContent: boolean,
        public subject: Subject,
        public teacher: Array<Teacher>
    ){}
}
