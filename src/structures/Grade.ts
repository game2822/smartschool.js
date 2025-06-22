import { Subject } from "../types/Assignment";

export class Grade {
    constructor(
        public id: string,
        public isGraded: boolean,
        public value: number,
        public outOf: number,
        public date: Date,
        public coefficient: number,
        public title?: string,
        public topic?: string,
        public subject?: Subject,
        public notGradedReason?: string
    ){}
}
