import { SkillLevels } from "../util/Constants";

export class SkillLevel {
    constructor(
        public label: string,
        public shortLabel: string,
        public level: SkillLevels,
        public color?: string
    ){}
}
