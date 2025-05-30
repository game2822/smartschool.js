import { BaseIncluded, RelationshipData } from "./RequestHandler";

export interface AgendaAttributes {
    date: string;
}

export type lessonIncluded = BaseIncluded<
"lesson",
{
    startDateTime: string;
    endDateTime: string;
    title: string;
    location: string;
    canceled: boolean;
    anyHomeworkToDoForTheLesson: boolean;
    anyHomeworkToDoAfterTheLesson: boolean;
    anyContent: boolean;
},
{
    teachers: RelationshipData<"teacher">;
    subject: RelationshipData<"subject">;
}
>;
