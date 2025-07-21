import { School } from "../structures/School";
import { BASE_URL, USER_INFO } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Skolengo } from "../structures/Skolengo";
import { DecodePayload } from "../util/JWT";
import { JWTPayload } from "../types/OIDC";
import { Kind } from "../util/Constants";
import { BaseResponse } from "../types/RequestHandler";
import { schoolIncluded } from "../types/School";
import { KidData, studentIncluded, UserAttributes } from "../types/User";
import { getMultipleRelations, getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const GetUserInfo = async (
    accessToken: string,
    refreshToken: string,
    wellKnownURL: string,
    refreshURL: string,
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
    const attributes = userInfo.attributes as UserAttributes;
    const kind = determineAccountKind(userInfo.type);
    const kids: Array<KidData> = [];
    let schoolId = "";

    if (kind === Kind.STUDENT) {
        schoolId = getSingleRelation(userInfo.relationships.school)?.id ?? "";
    }

    if (kind === Kind.PARENT) {
        const kidId = getMultipleRelations(userInfo.relationships.students);
        if (kidId.length === 0) {
            throw new Error("No kids found for this parent.");
        }

        const kidInfo = response.included.find(
            item => item.id === kidId[0].id && item.type === "student"
        ) as studentIncluded;

        schoolId = getSingleRelation(kidInfo.relationships?.school)?.id ?? "";

        for (const kid of kidId) {
            const kidData = response.included.find(
                item => item.id === kid.id && item.type === "student"
            ) as studentIncluded;

            if (!kidData) {
                throw new Error(`Kid with ID ${kid.id} not found in response.`);
            }

            kids.push({
                id:          kidData.id,
                lastName:    kidData.attributes?.lastName ?? "",
                firstName:   kidData.attributes?.firstName ?? "",
                photoUrl:    kidData.attributes?.photoUrl ?? "",
                className:   kidData.attributes?.className ?? "",
                dateOfBirth: new Date(kidData.attributes?.dateOfBirth ?? ""),
                regime:      kidData.attributes?.regime ?? ""
            });
        }
    }

    const school = response.included.find(
        item => item.id === schoolId
    ) as schoolIncluded;
    const schoolAttr = school?.attributes;

    const schoolInstance = new School(
        school?.id ?? "",
        schoolAttr?.name ?? "",
        emsCode,
        wellKnownURL,
        { city: schoolAttr?.city ?? "" },
        undefined,
        schoolAttr?.administrativeId,
        schoolAttr?.subscribedServices
    );
    const client = new Skolengo(
        accessToken,
        refreshToken,
        refreshURL,
        (payload.exp - 300) * 1000,
        userInfo.id,
        attributes.firstName,
        attributes.lastName,
        attributes.className,
        attributes.mobilePhone,
        new Date(attributes.dateOfBirth),
        attributes.regime,
        kind,
        attributes.permissions.flatMap(p => p.permittedOperations),
        schoolInstance
    );

    await client.initKids(kids);
    return client;
};

function determineAccountKind(type: string): Kind {
    switch (type) {
        case "legalRepresentativeUserInfo": {
            return Kind.PARENT;
        }
        default: {
            return Kind.STUDENT;
        }
    }
}
