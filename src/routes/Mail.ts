import { BaseDataResponse, BaseResponse, MailFolderType, nonTeachingStaffIncluded } from "..";
import { BASE_URL, MAIL, MAIL_PARTICIPATIONS, MAIL_SETTINGS } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { Attachment } from "../structures/Attachment";
import { Mail } from "../structures/Mail";
import { MailFolder } from "../structures/MailFolder";
import { Message } from "../structures/Message";
import { attachmentInclude } from "../types/Assignment";
import {
    CommunicationAttributes,
    folderIncluded,
    MailSettings,
    ParticipationAttributes,
    participationIncluded,
    personParticipantIncluded,
    signatureIncluded,
    userMailSettingAttributes
} from "../types/Mail";
import { schoolInfoTechnicalUser } from "../types/News";
import { getMultipleRelations, getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const GetMailSettings = async (userId: string, emsCode: string, accessToken: string): Promise<MailSettings> => {
    const response = await manager.get<BaseResponse>(MAIL_SETTINGS(userId), {
        "include":                 "signature,folders,folders.parent",
        "fields[userMailSetting]": "maxCharsInParticipationContent,maxCharsInCommunicationSubject",
        "fields[signature]":       "content",
        "fields[folder]":          "name,position,type,parent"
    }, {
        "Authorization":       `Bearer ${accessToken}`,
        "x-skolengo-ems-code": emsCode
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    const data = response.data as BaseDataResponse<"userMailSetting", userMailSettingAttributes>;
    const rawSignature = getSingleRelation(data.relationships.signature);
    const rawFolders = getMultipleRelations(data.relationships.folders);

    const signature = includedMap.get(`signature:${rawSignature?.id ?? ""}`) as signatureIncluded;
    const folders: Array<MailFolder> = rawFolders.map(folderRelation => {
        const folderData = includedMap.get(`folder:${folderRelation.id}`) as folderIncluded;
        return {
            id:       folderRelation.id,
            name:     folderData.attributes?.name ?? "",
            position: folderData.attributes?.position ?? 0,
            type:     folderData.attributes?.type ?? MailFolderType.PERSONAL
        };
    });

    return {
        maxCharsInCommunicationSubject: data.attributes?.maxCharsInCommunicationSubject ?? 0,
        maxCharsInParticipationContent: data.attributes?.maxCharsInParticipationContent ?? 0,
        signature:                      signature.attributes?.content ?? "",
        folders
    };
};

export const GetMailsFromFolder = async (folderId: string, limit: number, offset: number, emsCode: string, accessToken: string): Promise<Array<Mail>> => {
    const response = await manager.get<BaseResponse>(MAIL(), {
        "filter[folders.id]":        folderId,
        "include":                   "lastParticipation,lastParticipation.sender,lastParticipation.sender.person,lastParticipation.sender.technicalUser",
        "fields[communication]":     "subject,participationsNumber,recipientsSummary,read,replyToAllAllowed,replyToSenderAllowed,readTrackingEnabled,lastParticipation",
        "fields[participation]":     "dateTime,content,sender",
        "fields[personParticipant]": "person,technicalUser",
        "fields[person]":            "firstName,lastName,photoUrl",
        "fields[technicalUser]":     "label",
        "page[limit]":               limit,
        "page[offset]":              offset
    }, {
        "Authorization":       `Bearer ${accessToken}`,
        "x-skolengo-ems-code": emsCode
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"communication", CommunicationAttributes> => item.type === "communication")
        .map(mail => {
            const recipients = mail.attributes?.recipientsSummary.match(/<span(?:\s+[^>]*)?>(.*?)<\/span>/g)?.map(s =>
                s.replaceAll(/<[^>]+>/g, "")
            );

            const partId = getSingleRelation(mail.relationships.lastParticipation);
            const partData = includedMap.get(`participation:${partId?.id ?? ""}`) as participationIncluded;
            const sender = getSingleRelation(partData.relationships?.sender);
            const personData = includedMap.get(`personParticipant:${sender?.id ?? ""}`) as personParticipantIncluded;
            const realSender = personData.relationships?.technicalUser.data ? getSingleRelation(personData.relationships?.technicalUser) : getSingleRelation(personData.relationships?.person);
            const realSenderData = realSender && realSender.type === "technicalUser" ? includedMap.get(`${realSender?.type}:${realSender?.id ?? ""}`) as schoolInfoTechnicalUser : includedMap.get(`${realSender?.type ?? ""}:${realSender?.id ?? ""}`) as nonTeachingStaffIncluded;

            return new Mail(
                emsCode,
                accessToken,
                mail.id,
                mail.attributes?.subject ?? "",
                mail.attributes?.participationsNumber ?? 1,
                recipients ?? [],
                mail.attributes?.read ?? false,
                mail.attributes?.replyToAllAllowed ?? false,
                mail.attributes?.replyToSenderAllowed ?? false,
                mail.attributes?.readTrackingEnabled ?? false,
                new Date(partData.attributes?.dateTime ?? ""),
                partData.attributes?.content ?? "",
                {
                    id:   realSender?.id ?? "",
                    name: realSender?.type === "technicalUser"
                        ? (realSenderData && "attributes" in realSenderData && realSenderData.attributes && "label" in realSenderData.attributes
                            ? realSenderData.attributes.label
                            : "")
                        : (realSenderData && "attributes" in realSenderData && realSenderData.attributes && "firstName" in realSenderData.attributes && "lastName" in realSenderData.attributes
                            ? `${realSenderData.attributes.firstName} ${realSenderData.attributes.lastName}`
                            : "")
                }
            );
        });
};

export const GetMessagesFromMail = async (mailId: string, emsCode: string, accessToken: string): Promise<Array<Message>> => {
    const response = await manager.get<BaseResponse>(MAIL_PARTICIPATIONS(mailId), {
        "include":                   "sender,sender.person,sender.technicalUser,attachments",
        "fields[participation]":     "dateTime,content,read,sender",
        "fields[personParticipant]": "additionalInfo,person,technicalUser",
        "fields[person]":            "firstName,lastName,title,photoUrl",
        "fields[technicalUser]":     "label",
        "fields[attachment]":        "name,mimeType,mimeTypeLabel,size,url"
    }, {
        "Authorization":       `Bearer ${accessToken}`,
        "x-skolengo-ems-code": emsCode
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"participation", ParticipationAttributes> => item.type === "participation")
        .map(message => {
            const attachmentsIDs = getMultipleRelations(message.relationships.attachments);
            const attachments: Array<Attachment> = attachmentsIDs.map(attachment => {
                const data = includedMap.get(`attachment:${attachment.id}`) as attachmentInclude;
                return new Attachment(
                    accessToken,
                    attachment.id,
                    data.attributes!.url,
                    data.attributes!.name,
                    data.attributes!.mimeType,
                    data.attributes!.mimeTypeLabel,
                    data.attributes!.size
                );
            });

            const sender = getSingleRelation(message.relationships?.sender);
            const personData = includedMap.get(`personParticipant:${sender?.id ?? ""}`) as personParticipantIncluded;
            const realSender = personData.relationships?.technicalUser.data ? getSingleRelation(personData.relationships?.technicalUser) : getSingleRelation(personData.relationships?.person);
            const realSenderData = realSender && realSender.type === "technicalUser" ? includedMap.get(`${realSender?.type}:${realSender?.id ?? ""}`) as schoolInfoTechnicalUser : includedMap.get(`${realSender?.type ?? ""}:${realSender?.id ?? ""}`) as nonTeachingStaffIncluded;
            return new Message(
                message.id,
                new Date(message.attributes?.dateTime ?? ""),
                message.attributes?.content ?? "",
                message.attributes?.read ?? false,
                attachments,
                {
                    id:   realSender?.id ?? "",
                    name: realSender?.type === "technicalUser"
                        ? (realSenderData && "attributes" in realSenderData && realSenderData.attributes && "label" in realSenderData.attributes
                            ? realSenderData.attributes.label
                            : "")
                        : (realSenderData && "attributes" in realSenderData && realSenderData.attributes && "firstName" in realSenderData.attributes && "lastName" in realSenderData.attributes
                            ? `${realSenderData.attributes.firstName} ${realSenderData.attributes.lastName}`
                            : "")
                }
            );
        });
};
