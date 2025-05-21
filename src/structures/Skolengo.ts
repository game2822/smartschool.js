import { School } from "./School";
import { Kind, Permissions } from "../util/Constants";
import { News } from "./News";
import { GetSchoolNews } from "../routes/School";

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

    public async getNews(): Promise<News[]> {
        return await GetSchoolNews(this.accessToken, this.school.emsCode)
    }
}
