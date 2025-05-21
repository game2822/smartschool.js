import { School } from "./School";
import { News } from "./News";
import { Assignment } from "./Assignment";
import { Kind, Permissions } from "../util/Constants";
import { GetSchoolNews } from "../routes/School";
import { GetAssignments } from "../routes/User";

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
        public permissions: Array<Permissions>,
        public school: School
    ){}

    async GetAssignments(): Promise<Array<Assignment>> {
        return GetAssignments(this.userId, this.accessToken, this.school.emsCode, this.school.id);
    }

    async GetNews(): Promise<Array<News>> {
        return GetSchoolNews(this.accessToken, this.school.emsCode);
    }


}
