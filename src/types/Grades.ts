import { BaseIncluded, RelationshipData } from "./RequestHandler";
import { Period } from "../structures/Period";
import { SkillLevel } from "../structures/SkillLevel";
import { SkillLevels } from "../util/Constants";

export interface GradesAttributes {
    mark: number;
    nonEvaluationReason: string | null;
}

export interface GradesSettingsAttributes {
    periodicReportsEnabled: boolean;
    skillsEnabled: boolean;
    evaluationsDetailsAvailable: boolean;
}

export type gradesIncluded = BaseIncluded<
"evaluation",
{
    dateTime: string;
    scale: number;
    coefficient: number;
    topic: string;
    title: string;
},
{
    subSubject: RelationshipData<"subSubject">;
    evaluationService: RelationshipData<"evaluationService">;
    evaluationResult: RelationshipData<"evaluationResult">;
}
>;

export type gradesServiceIncluded = BaseIncluded<
"evaluationService",
undefined,
{
    subject: RelationshipData<"subject">;
}
>;

export interface GradesSettings extends GradesSettingsAttributes {
    periods: Array<Period>;
}

export type periodIncluded = BaseIncluded<
"period",
{
    label: string;
    startDate: string;
    endDate: string;
},
undefined
>;

export type skillColorsIncluded = BaseIncluded<"skillAcquisitionColors", {
    colorLevelMappings: Array<{
        level: string;
        color: string;
    }>;
}, undefined>;

export type skillsIncluded = BaseIncluded<"skillsSetting", {
    skillAcquisitionLevels: Array<{
        label: string;
        shortLabel: string;
        level: SkillLevels;
    }>;
}, {
    skillAcquisitionColors: RelationshipData<"skillAcquisitionColors">;
}>;

export interface GradesServiceAttribute {
    coefficient: number;
    average: number;
    scale: number;
    studentAverage: number;
}

export type gradeResultIncluded = BaseIncluded<"evaluationResult", {
    mark: number;
    nonEvaluationReason: string | null;
}, {
    subSkillsEvaluationResults: RelationshipData<"subSkillsEvaluationResults">;
}>;
