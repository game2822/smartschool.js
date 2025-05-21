import { Permissions } from "../util/Constants";
import { Relationships } from "./RequestHandler";

export interface UserResponseData {
    id: string;
    relationships: Relationships;
    type: "studentUserInfo";
    attributes: UserAttributes;
}

export interface UserAttributes {
    regime: string;
    audienceId: string;
    firstName: string;
    lastName: string;
    className: string;
    dateOfBirth: string;
    externalMail: string;
    photoUrl: string | null;
    mobilePhone: string;
    permissions: Array<Permission>;
}

export interface Permission {
    service: string;
    schoolId: string;
    permittedOperations: Array<Permissions>;
}
