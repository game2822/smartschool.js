import { Assignment } from "./Assignment";
import { Lesson } from "./Lesson";

export class TimetableDay {
    constructor(
        public date: Date,
        public lessons: Array<Lesson>,
        public assignments: Array<Assignment>
    ){}
}
