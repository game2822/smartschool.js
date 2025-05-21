import { School } from "../structures/School";
import { BASE_URL, USER_ASSIGNMENTS, USER_INFO } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { Skolengo } from "../structures/Skolengo";
import { DecodePayload } from "../util/JWT";
import { JWTPayload } from "../types/OIDC";
import { Kind } from "../util/Constants";
import { BaseResponse } from "../types/RequestHandler";
import { schoolIncluded } from "../types/School";
import { AssignementsResponseData, subjectIncluded, teacherIncluded } from "../types/Assignment";
import { Assignment } from "../structures/Assignment";

const manager = new RestManager(BASE_URL());

export const GetUserInfo = async (
    accessToken: string,
    refreshToken: string,
    wellKnownURL: string,
    emsCode: string
): Promise<Skolengo> => {
    const payload = DecodePayload(accessToken) as unknown as JWTPayload;

    const headers = {
        "Authorization":       `Bearer ${accessToken}`,
        "x-skolengo-ems-code": emsCode
    };

    const query = {
        "include": "school,students,students.school,schools,prioritySchool",
        "fields[userInfo]":
      "lastName,firstName,photoUrl,externalMail,mobilePhone,audienceId,permissions",
        "fields[school]":
      "name,timeZone,subscribedServices,city,schoolAudience,administrativeId",
        "fields[legalRepresentativeUserInfo]":
      "addressLines,postalCode,city,country,students",
        "fields[studentUserInfo]":             "className,dateOfBirth,regime,school",
        "fields[teacherUserInfo]":             "schools,prioritySchool",
        "fields[localAuthorityStaffUserInfo]": "schools,prioritySchool",
        "fields[nonTeachingStaffUserInfo]":    "schools,prioritySchool",
        "fields[otherPersonUserInfo]":         "schools,prioritySchool",
        "fields[student]":
      "firstName,lastName,photoUrl,className,dateOfBirth,regime,school"
    };

    const response = await manager.get<BaseResponse>(USER_INFO(payload.sub), query, headers);

    if (Array.isArray(response.data)) {
        throw new TypeError("Expected a single user object in response data.");
    }

    const userInfo = response.data;
    const attributes = userInfo.attributes;
    const schoolId = userInfo.relationships.school?.data.id;

    const school = response.included.find(
        item => item.id === schoolId
    ) as schoolIncluded;
    const schoolAttr = school?.attributes;

    const schoolInstance = new School(
        school?.id ?? "",
        schoolAttr?.name ?? "",
        school?.type ?? "",
        emsCode,
        wellKnownURL,
        { city: schoolAttr?.city ?? "" },
        undefined,
        schoolAttr?.administrativeId,
        schoolAttr?.subscribedServices
    );

    if (!Object.values(Kind).includes(payload.profile as Kind)) {
        throw new Error(
            `Unsupported profile "${payload.profile}", please open an issue on GitHub.`
        );
    }

    return new Skolengo(
        accessToken,
        refreshToken,
        userInfo.id,
        attributes.firstName,
        attributes.lastName,
        attributes.className,
        attributes.mobilePhone,
        new Date(attributes.dateOfBirth),
        attributes.regime,
        payload.profile as Kind,
        attributes.permissions.flatMap(p => p.permittedOperations),
        schoolInstance
    );
};

export const GetAssignments = async (
    userId: string,
    accessToken: string,
    emsCode: string,
    schoolId: string,
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
        "Authorization":        `Bearer ${accessToken}`,
        "x-skolengo-ems-code":  emsCode,
        "x-skolengo-school-id": schoolId
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is AssignementsResponseData => item.type === "homework")
        .map(assignment => {
            const teacherId = assignment.relationships.teacher?.data.id;
            const teacher = teacherId ? includedMap.get(`teacher:${teacherId}`) as teacherIncluded : null;
            const subjectId = assignment.relationships.subject?.data.id;
            const subject = subjectId ? includedMap.get(`subject:${subjectId}`) as subjectIncluded : null;

            return new Assignment(
                assignment.id,
                assignment.attributes.done,
                assignment.attributes.title,
                assignment.attributes.html,
                new Date(assignment.attributes.dueDateTime),
                assignment.attributes.deliverWorkOnline,
                assignment.attributes.onlineDeliverUrl,
                {
                    id:        teacherId                      ?? "",
                    title:     teacher?.attributes?.title     ?? "",
                    firstName: teacher?.attributes?.firstName ?? "",
                    lastName:  teacher?.attributes?.lastName  ?? "",
                    photoUrl:  teacher?.attributes?.photoUrl  ?? ""
                },
                {
                    id:    subjectId                   ?? "",
                    label: subject?.attributes?.label  ?? "",
                    color: subject?.attributes?.color  ?? ""
                }
            );
        });
};

