import { School } from "../structures/School";
import { BASE_URL, USER_INFO } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { Skolengo } from "../structures/Skolengo";
import { StudentUserInfoResponse } from "../types/User";
import { DecodePayload } from "../util/JWT";
import { JWTPayload } from "../types/OIDC";
import { Kind } from "../util/Constants";

const manager = new RestManager(BASE_URL());

export const GetUserInfo = async (accessToken: string, refreshToken: string, wellKnownURL: string): Promise<Skolengo> => {
    const payload = DecodePayload(accessToken) as unknown as JWTPayload;
    const response = await manager.get<StudentUserInfoResponse>(USER_INFO(payload.sub), {
        "include": "school,students,students.school,schools,prioritySchool",
        "fields[userInfo]": "lastName,firstName,photoUrl,externalMail,mobilePhone,audienceId,permissions",
        "fields[school]": "name,timeZone,subscribedServices,city,schoolAudience,administrativeId",
        "fields[legalRepresentativeUserInfo]": "addressLines,postalCode,city,country,students",
        "fields[studentUserInfo]": "className,dateOfBirth,regime,school",
        "fields[teacherUserInfo]": "schools,prioritySchool",
        "fields[localAuthorityStaffUserInfo]": "schools,prioritySchool",
        "fields[nonTeachingStaffUserInfo]": "schools,prioritySchool",
        "fields[otherPersonUserInfo]": "schools,prioritySchool",
        "fields[student]": "firstName,lastName,photoUrl,className,dateOfBirth,regime,school"
    }, {
        "x-skolengo-ems-code": "rra",
        "Authorization": `Bearer ${accessToken}`,
        "content-type": "application/vnd.api+json",
        "x-skolengo-date-format": "utc"
    });

    let school = response.included.find(school => school.id === response.data.relationships.school.data.id);
    const SchoolClass = new School(
        school?.id || "",
        school?.attributes.name || "",
        school?.type || "",
        wellKnownURL,
        {
            city: school?.attributes.city || ""
        }
    )

    if (!Object.values(Kind).includes(payload.profile as Kind)) {
        throw new Error(`We don't support ${payload.profile} yet, please open an issue on GitHub`);
    }

    return new Skolengo(
        accessToken,
        refreshToken,
        response.data.id,
        response.data.attributes.firstName,
        response.data.attributes.lastName,
        response.data.attributes.className,
        response.data.attributes.mobilePhone,
        new Date(response.data.attributes.dateOfBirth),
        response.data.attributes.regime,
        payload.profile as Kind,
        response.data.attributes.permissions.map(permission => permission.permittedOperations).flat(),
        SchoolClass
    );
}