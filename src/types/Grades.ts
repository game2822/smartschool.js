import { BaseIncluded, RelationshipData } from "./RequestHandler";

export interface GradesAttributes {
    mark: number;
    nonEvaluationReason: string | null;
}

export type gradesIncluded = BaseIncluded<
"evaluation",
{
    dateTime: string;
    scale: number;
},
{
    subSubject: RelationshipData<"subSubject">;
    evaluationService: RelationshipData<"evaluationService">;
}
>;

export type gradesServiceIncluded = BaseIncluded<
"evaluationService",
undefined,
{
    subject: RelationshipData<"subject">;
}
>;
