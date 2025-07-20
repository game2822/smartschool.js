import { BaseIncluded, RelationshipData } from "./RequestHandler";
import { MailFolder } from "../structures/MailFolder";
import { MailFolderType } from "../util/Constants";

export interface CommunicationAttributes {
    subject: string;
    participationsNumber: number;
    recipientsSummary: string;
    read: boolean;
    replyToAllAllowed: boolean;
    replyToSenderAllowed: boolean;
    readTrackingEnabled: boolean | null;
}

export interface ParticipationAttributes {
    dateTime: string;
    content: string;
    read: boolean;
}

export type participationIncluded = BaseIncluded<"participation", {
    dateTime: string;
    content: string;
}, {
    sender: RelationshipData<"personParticipant">;
}>;

export type personParticipantIncluded = BaseIncluded<"personParticipant", undefined, {
    technicalUser: RelationshipData<"technicalUser">;
    person: RelationshipData<"teacher"> | RelationshipData<"nonTeachingStaff"> | RelationshipData<"personInContactWithStudent">;
}>;

export type folderIncluded = BaseIncluded<"folder", {
    name: string;
    position: number;
    type: MailFolderType;
}>;

export type signatureIncluded = BaseIncluded<"signature", {
    content: string;
}>;


export interface userMailSettingAttributes {
    maxCharsInParticipationContent: number;
    maxCharsInCommunicationSubject: number;
}

export interface MailSettings extends userMailSettingAttributes {
    signature: string;
    folders: Array<MailFolder>;
    recipients: Array<Recipients>;
}

export interface  Recipients {
    id: string;
    type: "personContact" | "groupContact";
}
