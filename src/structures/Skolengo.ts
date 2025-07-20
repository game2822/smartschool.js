import { School } from "./School";
import { News } from "./News";
import { Assignment } from "./Assignment";
import { AttendanceItem } from "./AttendanceItem";
import { TimetableDay } from "./TimetableDay";
import { Grade } from "./Grade";
import { Subject } from "./Subject";
import { MailFolder } from "./MailFolder";
import { Mail } from "./Mail";
import { Kind, Permissions } from "../util/Constants";
import { GetSchoolNews } from "../routes/School";
import { GetAssignments } from "../routes/Assignments";
import { GetAttendanceItems } from "../routes/Attendance";
import { getTimetableForPeriods } from "../routes/Agenda";
import { GradesSettings } from "../types/Grades";
import { GetGradesForPeriod, GetGradesSettings, GetLastGrades } from "../routes/Grades";
import { MailSettings, Recipients } from "../types/Mail";
import { GetMailSettings, GetMailsFromFolder, SendMail } from "../routes/Mail";
import { OIDCRefresh } from "../routes/OIDC";

export class Skolengo {
    constructor(
        protected accessToken: string,
        protected refreshToken: string,
        protected refreshURL: string,
        protected accessTokenTTL: number,
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

    private async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) {
            throw new Error("No refresh token available. Please authenticate again.");
        }
        if (Date.now() >= this.accessTokenTTL) {
            const response = await OIDCRefresh(this.refreshURL, this.refreshToken);
            this.accessToken = response.access_token;
            this.refreshToken = response.refresh_token;
            return true;
        }
        return false;
    }
    async GetAllMails(limitPerFolder = 20, offset = 0): Promise<Array<MailFolder>> {
        await this.refreshAccessToken();
        const folders: Array<MailFolder> = (await this.GetMailSettings()).folders;
        for (const folder of folders) {
            const mails: Array<Mail> = await GetMailsFromFolder(folder.id, limitPerFolder, offset, this.school.emsCode, this.accessToken);
            if (!folder.mails) folder.mails = [];
            folder.mails?.push(...mails);
        }
        return folders;
    }
    async GetAssignments(periodStart?: Date, periodEnd?: Date): Promise<Array<Assignment>> {
        await this.refreshAccessToken();
        return GetAssignments(this.userId, this.accessToken, this.school.emsCode, this.school.id, periodStart, periodEnd);
    }
    async GetAttendanceItems(): Promise<Array<AttendanceItem>> {
        await this.refreshAccessToken();
        return GetAttendanceItems(this.userId, this.school.id, this.school.emsCode, this.accessToken);
    }
    async GetGradesForPeriod(period?: string): Promise<Array<Subject>> {
        await this.refreshAccessToken();
        const periods = [];
        if (!period) {
            periods.push(...(await this.GetGradesSettings()).periods);
            if (!periods[0]) throw new Error("We are unable to find any periods.");
        }
        return GetGradesForPeriod(this.userId, this.accessToken, this.school.emsCode, this.school.id, period ?? periods[0].id);
    }
    async GetGradesSettings(): Promise<GradesSettings> {
        await this.refreshAccessToken();
        return GetGradesSettings(this.userId, this.accessToken, this.school.emsCode, this.school.id);
    }
    async GetLastGrades(limit?: number, offset?: number): Promise<Array<Grade>> {
        await this.refreshAccessToken();
        return GetLastGrades(this.userId, this.accessToken, this.school.emsCode, this.school.id, limit, offset);
    }
    async GetMailFromFolder(folderId: string, limit: number, offset: number): Promise<Array<Mail>> {
        await this.refreshAccessToken();
        return GetMailsFromFolder(folderId, limit, offset, this.school.emsCode, this.accessToken);
    }


    async GetMailSettings(): Promise<MailSettings> {
        await this.refreshAccessToken();
        return GetMailSettings(this.userId, this.school.emsCode, this.accessToken);
    }

    async GetNews(): Promise<Array<News>> {
        await this.refreshAccessToken();
        return GetSchoolNews(this.accessToken, this.school.emsCode);
    }
    async GetTimetable(periodStart?: Date, periodEnd?: Date): Promise<Array<TimetableDay>> {
        await this.refreshAccessToken();
        return getTimetableForPeriods(this.userId, this.school.id, this.school.emsCode, this.accessToken, periodStart, periodEnd);
    }
    async SendMail(subject: string, content: string, recipients?: Array<Recipients>, cc?: Array<Recipients>, bcc?: Array<Recipients>): Promise<Mail> {
        await this.refreshAccessToken();
        return SendMail(subject, content, recipients, cc, bcc, this.school.emsCode, this.accessToken);
    }


}
