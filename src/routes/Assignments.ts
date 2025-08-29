import { BASE_URL, USER_ASSIGNMENT, USER_ASSIGNMENTS } from "../rest/endpoints";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { Assignment } from "../structures/Assignment";
import { RestManager } from "../rest/RESTManager";
import { attachmentInclude, HomeworkAttributes, subjectIncluded, teacherIncluded } from "../types/Assignment";
import { Attachment } from "../structures/Attachment";
import { getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const GetAssignments = async (
    userId: string,
    accessToken: string,
    periodStart = new Date(),
    periodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1))
): Promise<Array<Assignment>> => {
    const formatDate = (date: Date): string =>
        date.toISOString().slice(0, 10);

    const response = await manager.get<BaseResponse>(USER_ASSIGNMENTS(), {
        "filter[student.id]":  userId,
        "filter[dueDate][GE]": formatDate(periodStart),
        "filter[dueDate][LE]": formatDate(periodEnd),
        "include":             "subject,teacher,individualCorrectedWork,individualCorrectedWork.attachments,individualCorrectedWork.audio,commonCorrectedWork.attachments,commonCorrectedWork.audio,commonCorrectedWork.pedagogicContent",
        "fields[homework]":    "title,html,deliverWorkOnline,onlineDeliveryUrl,done,dueDateTime",
        "fields[subject]":     "label,color"
    }, {
        Authorization: `Bearer ${accessToken}`
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"homework", HomeworkAttributes> => item.type === "homework")
        .map(assignment => {
            const teacherId = getSingleRelation(assignment.relationships.teacher)?.id;
            const teacher = teacherId ? includedMap.get(`teacher:${teacherId}`) as teacherIncluded : null;
            const subjectId = getSingleRelation(assignment.relationships.subject)?.id;
            const subject = subjectId ? includedMap.get(`subject:${subjectId}`) as subjectIncluded : null;

            return new Assignment(
                accessToken,
                userId,
                assignment.id,
                assignment.attributes?.done ?? false,
                assignment.attributes?.title ?? "",
                assignment.attributes?.html ?? "",
                new Date(assignment.attributes?.dueDateTime ?? ""),
                assignment.attributes?.deliverWorkOnline ?? false,
                assignment.attributes?.onlineDeliverUrl ?? "",
                {
                    id:    subjectId                   ?? "",
                    label: subject?.attributes?.label  ?? "",
                    color: subject?.attributes?.color  ?? ""
                },
                {
                    id:        teacherId                      ?? "",
                    title:     teacher?.attributes?.title     ?? "",
                    firstName: teacher?.attributes?.firstName ?? "",
                    lastName:  teacher?.attributes?.lastName  ?? "",
                    photoUrl:  teacher?.attributes?.photoUrl  ?? ""
                }
            );
        });
};

export const GetAssignmentAttachments = async (assignmentId: string, userId: string, accessToken: string): Promise<Array<Attachment>> => {
    const response = await manager.get<BaseResponse>(USER_ASSIGNMENT(assignmentId), {
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
            const attachment = value as attachmentInclude;
            return new Attachment(
                accessToken,
                attachment.id,
                attachment.attributes?.url ?? "",
                attachment.attributes?.name ?? "",
                attachment.attributes?.mimeType ?? "",
                attachment.attributes?.mimeTypeLabel ?? "",
                attachment.attributes?.size ?? 0
            );
        });
};

export const SetAssignmentCompletion = async (
    assignmentId: string,
    userId: string,
    completed: boolean,
    accessToken: string,
): Promise<Assignment> => {
    const response = await manager.patch<BaseResponse>(
        USER_ASSIGNMENT(assignmentId),
        { data: { type: "homework",id: assignmentId,attributes: { done: completed } } },
        {
            "filter[student.id]": userId,
            "include":            "attachments",
            "fields[attachment]": "name,mimeType,mimeTypeLabel,size,url"
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }
    const data = response.data as BaseDataResponse<"homework", HomeworkAttributes>;
    const subjectId = getSingleRelation(data.relationships.subject)?.id;
    const teacherId = getSingleRelation(data.relationships.teacher)?.id;
    const subject = subjectId ? includedMap.get("subject:" + subjectId) as subjectIncluded : null;
    const teacher = teacherId ? includedMap.get("teacher:" + teacherId) as teacherIncluded : null;

    return new Assignment(
        accessToken,
        userId,
        assignmentId,
        completed,
        data.attributes?.title ?? "",
        data.attributes?.html ?? "",
        new Date(data.attributes?.dueDateTime ?? ""),
        data.attributes?.deliverWorkOnline ?? false,
        data.attributes?.onlineDeliverUrl ?? "",
        {
            id:    subject?.id                ?? "",
            label: subject?.attributes?.label ?? "",
            color: subject?.attributes?.color ?? ""
        },
        {
            id:        teacher?.id                    ?? "",
            title:     teacher?.attributes?.title     ?? "",
            firstName: teacher?.attributes?.firstName ?? "",
            lastName:  teacher?.attributes?.lastName  ?? "",
            photoUrl:  teacher?.attributes?.photoUrl  ?? ""
        }
    );
};
