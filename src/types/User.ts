import { Permissions } from "../util/Constants";

export interface StudentUserInfoResponse {
  data: StudentUserInfoData;
  included: School[];
}

export interface StudentUserInfoData {
  id: string;
  /** can maybe use to determine account kind */
  type: 'studentUserInfo' | string;
  attributes: StudentUserInfoAttributes;
  relationships: {
    school: {
      data: {
        id: string;
        type: 'school';
      };
    };
  };
}

export interface StudentUserInfoAttributes {
  regime: string;
  audienceId: string;
  firstName: string;
  lastName: string;
  className: string;
  dateOfBirth: string;
  externalMail: string;
  photoUrl: string | null;
  mobilePhone: string;
  permissions: Permission[];
}

export interface Permission {
  service: string;
  schoolId: string;
  permittedOperations: Permissions[];
}

export interface School {
  id: string;
  type: 'school';
  attributes: SchoolAttributes;
}

export interface SchoolAttributes {
  timeZone: string;
  subscribedServices: string[];
  administrativeId: string;
  schoolAudience: SchoolAudience;
  name: string;
  city: string;
}

export interface SchoolAudience {
  enabled: boolean;
  audienceId: string;
  projectId: string;
}
