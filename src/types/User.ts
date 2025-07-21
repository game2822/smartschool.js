import {Permissions, Services} from "../util/Constants";
import {BaseIncluded, RelationshipData} from "./RequestHandler";
import {SchoolAudience} from "./School";

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

export type studentIncluded = BaseIncluded<"student", {
    lastName: string;
    firstName: string;
    photoUrl: string | null;
    className: string;
    dateOfBirth: string;
    regime: string;
},
{
    school: RelationshipData<"school">;
}>;

export interface KidData {
    id: string;
    lastName: string;
    firstName: string;
    photoUrl: string | null;
    className: string;
    dateOfBirth: Date;
    regime: string;
}
