import { USER_AGENDA, USER_ASSIGNMENT } from "../rest/endpoints";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { Assignment } from "../structures/Assignment";
import { RestManager } from "../rest/RESTManager";
import { attachmentInclude, HomeworkAttributes, subjectIncluded, teacherIncluded } from "../types/Assignment";
import { Attachment } from "../structures/Attachment";
import { getSingleRelation } from "../util/Relations";
import { url } from "inspector";
import { extractBaseUrl } from "../util/URL";


export const GetAssignments = async (
    url: string,
    userId: string,
    accessToken: string,
    deviceId: string,
    periodStart = new Date(),
    periodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1))
): Promise<Array<Assignment>> => {
    const formatDate = (date: Date): string =>
        date.toISOString();
        
    const [base] = extractBaseUrl(url);

    const manager = new RestManager(base);

   const response = await manager.get<BaseResponse>(USER_AGENDA(userId), {
        from:  formatDate(periodStart),
        to:    formatDate(periodEnd),
        types: "planned-to-dos,planned-lesson-cluster-assignments,planned-assignments"
    }, {
        Authorization: `Bearer ${accessToken}`,
        SmscMobileId:  deviceId
    });
    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response) ? response : [])
        .map(assignment => {
            const teacherId = assignment.organisers?.users[0]?.id;
            const teacher = teacherId ? includedMap.get(`teacher:${teacherId}`) as teacherIncluded : null;
            const subjectId = assignment.courses[0]?.id;
            const subject = subjectId ? includedMap.get(`subject:${subjectId}`) as subjectIncluded : null;

            return new Assignment(
                accessToken,
                url,
                deviceId,
                userId,
                assignment.id,
                assignment.resolvedStatus ?? false,
                assignment.name ?? "",
                assignment.attributes?.html ?? "",
                new Date(assignment.period?.dateTimeTo ?? ""),
                {
                    id:    assignment.courses[0]?.id                   ?? "",
                    label: assignment.courses[0]?.name  ?? "",
                    color: subject?.attributes?.color  ?? ""
                },
                {
                    id:        teacherId                      ?? "",
                    title:     teacher?.attributes?.title     ?? "",
                    name: teacher?.attributes?.firstName ?? "",
                    photoUrl:  teacher?.attributes?.photoUrl  ?? ""
                }
            );
        });
};

export const GetAssignmentAttachments = async (url: string, assignmentId: string, userId: string, accessToken: string, deviceId: string): Promise<Array<Attachment>> => {
    const [base] = extractBaseUrl(url);

    const manager = new RestManager(base);

    /*const response = await manager.get<BaseResponse>(USER_ASSIGNMENT(assignmentId), {
        "filter[student.id]": userId,
        "include":            "attachments",
        "fields[attachment]": "name,mimeType,mimeTypeLabel,size,url"
    }, {
        Authorization: `Bearer ${accessToken}`
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return Array.from(includedMap.entries())
        .filter(([key]) => key.startsWith("attachment:"))
        .map(([, value]) => {
            const attachment = value as attachmentInclude;*/
            return [
                new Attachment(
                    accessToken,
                    /*attachment.id ??*/ "",
                    /*attachment.attributes?.url ??*/ "",
                    /*attachment.attributes?.name ??*/ "",
                    /*attachment.attributes?.mimeType ??*/ "",
                    /*attachment.attributes?.mimeTypeLabel ??*/ "",
                    /*attachment.attributes?.size ??*/ 0
                )
            ];
        };

export const SetAssignmentCompletion = async (
    url: string,
    assignmentId: string,
    userId: string,
    completed: string,
    accessToken: string,
    SMSCMobileID: string
): Promise<Assignment> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);

    const response = await manager.post<BaseResponse>(
        USER_ASSIGNMENT(assignmentId, userId, completed),
        undefined,
        undefined,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "SmscMobileId": SMSCMobileID,
            }
        }
    );

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }
const assignment = Array.isArray(response) ? response[0] : response;
if (!assignment) {
    throw new Error("Assignment not found in response");
}
const subjectId = assignment.courses[0]?.id;
const teacherId = assignment.organisers.users[0]?.id;
const subject = subjectId ? includedMap.get("subject:" + subjectId) as subjectIncluded : null;
const teacher = teacherId ? includedMap.get("teacher:" + teacherId) as teacherIncluded : null;
let booleanCompleted: boolean;
if (completed === "resolve") {
    booleanCompleted = true;
} else {
    booleanCompleted = false;
}

return new Assignment(
    accessToken,
    url,
    SMSCMobileID,
    userId,
    assignmentId,
    booleanCompleted,
    assignment.name ?? "",
    assignment.attributes?.html ?? "",
    new Date(assignment.period?.dateTimeTo ?? ""),
    {
        id:    subject?.id                ?? "",
        label: subject?.attributes?.label ?? "",
        color: subject?.attributes?.color ?? ""
    },
    {
        id:        teacher?.id                    ?? "",
        title:     teacher?.attributes?.title     ?? "",
        name:      teacher?.attributes?.firstName ?? "",
        photoUrl:  teacher?.attributes?.photoUrl  ?? ""
    }
);
};
