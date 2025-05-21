import { School } from "../structures/School";
import { BASE_URL, USER_ASSIGNMENTS, USER_INFO } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { Skolengo } from "../structures/Skolengo";
import { DecodePayload } from "../util/JWT";
import { JWTPayload } from "../types/OIDC";
import { Kind, Services } from "../util/Constants";
import { BaseResponse } from "../types/RequestHandler";
import { schoolIncluded } from "../types/School";

const manager = new RestManager(BASE_URL());

export const GetUserInfo = async (
  accessToken: string,
  refreshToken: string,
  wellKnownURL: string,
  emsCode: string
): Promise<Skolengo> => {
  const payload = DecodePayload(accessToken) as unknown as JWTPayload;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "x-skolengo-ems-code": emsCode,
  };

  const query = {
    include: "school,students,students.school,schools,prioritySchool",
    "fields[userInfo]":
      "lastName,firstName,photoUrl,externalMail,mobilePhone,audienceId,permissions",
    "fields[school]":
      "name,timeZone,subscribedServices,city,schoolAudience,administrativeId",
    "fields[legalRepresentativeUserInfo]":
      "addressLines,postalCode,city,country,students",
    "fields[studentUserInfo]": "className,dateOfBirth,regime,school",
    "fields[teacherUserInfo]": "schools,prioritySchool",
    "fields[localAuthorityStaffUserInfo]": "schools,prioritySchool",
    "fields[nonTeachingStaffUserInfo]": "schools,prioritySchool",
    "fields[otherPersonUserInfo]": "schools,prioritySchool",
    "fields[student]":
      "firstName,lastName,photoUrl,className,dateOfBirth,regime,school",
  };

  const response = await manager.get<BaseResponse>(USER_INFO(payload.sub), query, headers);

  if (Array.isArray(response.data)) {
    throw new Error("Expected a single user object in response data.");
  }

  const userInfo = response.data;
  const attributes = userInfo.attributes;
  const schoolId = userInfo.relationships.school?.data.id;

  const school = response.included.find(
    (item) => item.id === schoolId
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
    attributes.permissions.flatMap((p) => p.permittedOperations),
    schoolInstance
  );
};

export const GetAssignments = async (
  userId: string,
  accessToken: string,
  emsCode: string,
  periodStart = new Date(),
  periodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1))
): Promise<string> => {
  const formatDate = (date: Date) =>
    date.toISOString().slice(0, 10);

  const response = await manager.get<BaseResponse>(USER_ASSIGNMENTS(), {
    "filter[student.id]": userId,
    "filter[dueDate][GE]": formatDate(periodStart),
    "filter[dueDate][LE]": formatDate(periodEnd),
    "include": "subject,teacher,individualCorrectedWork,individualCorrectedWork.attachments,individualCorrectedWork.audio,commonCorrectedWork.attachments,commonCorrectedWork.audio,commonCorrectedWork.pedagogicContent",
    "fields[homework]": "title,html,deliverWorkOnline,onlineDeliveryUrl,done,dueDateTime",
    "fields[subject]": "label,color"
  });

  return `${formatDate(periodStart)} to ${formatDate(periodEnd)}`;
};

