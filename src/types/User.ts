import { Permissions } from "../util/Constants";

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
