import { Kind, Permissions } from "../util/Constants";
import { School } from "./School";

export class Skolengo {
    constructor(
        private accessToken: string,
        private refreshToken: string,
        public userId: string,
        public firstName: string,
        public lastName: string,
        public className: string,
        public mobilePhone: string,
        public dateOfBirth: Date,
        public regime: string,
        public kind: Kind,
        public permissions: Permissions[],
        public school: School
    ){}
}
