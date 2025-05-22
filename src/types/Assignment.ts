import { BaseIncluded, Relationships } from "./RequestHandler";

export interface AssignementsResponseData {
    id: string;
    relationships: Relationships;
    type: "homework";
    attributes: HomeworkAttributes;
}

export interface HomeworkAttributes {
    done: boolean;
    title: string;
    html: string;
    dueDateTime: string;
    deliverWorkOnline: boolean;
    onlineDeliverUrl: string | null;
}

export type teacherIncluded = BaseIncluded<"teacher", {
    title: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
}>;

export type subjectIncluded = BaseIncluded<"subject", {
    label: string;
    color: string;
}>;

export type attachmentInclude = BaseIncluded<"attachment", {
    name: string;
    mimeType: string;
    mimeTypeLabel: string;
    size: number;
    /** You can't access it directly, you need to be authenticated */
    url: string;
}>;

export interface Teacher {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
}

export interface Subject {
    id: string;
    label: string;
    color: string;
}
