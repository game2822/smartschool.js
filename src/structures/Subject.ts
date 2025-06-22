import { Grade } from "./Grade";
import { Teacher } from "../types/Assignment";

export class Subject {
    constructor(
        public id: string,
        public name: string,
        public coefficient: number,
        public value: number,
        public outOf: number,
        public average: number,
        public grades: Array<Grade>,
        public teachers: Array<Teacher>
    ){}
}
