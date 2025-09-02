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
import { KidData } from "../types/User";

export class SmartSchool {
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
        public kind: Kind,
        public SMSCMobileID: string,
        public kids?: Array<SmartSchool>
    ){}

    async GetAllMails(limitPerFolder = 20, offset = 0): Promise<Array<MailFolder>> {
        await this.refreshAccessToken();
        const folders: Array<MailFolder> = (await this.GetMailSettings()).folders;
        for (const folder of folders) {
            const mails: Array<Mail> = await GetMailsFromFolder(folder.id, limitPerFolder, offset, this.accessToken);
            if (!folder.mails) folder.mails = [];
            folder.mails?.push(...mails);
        }
        return folders;
    }
    async GetAssignments(periodStart?: Date, periodEnd?: Date): Promise<Array<Assignment>> {
        await this.refreshAccessToken();
        return GetAssignments(this.userId, this.accessToken, periodStart, periodEnd);
    }
    async GetAttendanceItems(): Promise<Array<AttendanceItem>> {
        await this.refreshAccessToken();
        return GetAttendanceItems(this.userId, this.accessToken);
    }
    async GetGradesForPeriod(period?: string): Promise<Array<Subject>> {
        await this.refreshAccessToken();
        const periods = [];
        if (!period) {
            periods.push(...(await this.GetGradesSettings()).periods);
            if (!periods[0]) throw new Error("We are unable to find any periods.");
        }
        return GetGradesForPeriod(this.userId, this.accessToken,  period ?? periods[0].id);
    }
    async GetGradesSettings(): Promise<GradesSettings> {
        await this.refreshAccessToken();
        return GetGradesSettings(this.userId, this.accessToken);
    }
    async GetLastGrades(limit?: number, offset?: number): Promise<Array<Grade>> {
        await this.refreshAccessToken();
        return GetLastGrades(this.userId, this.accessToken, limit, offset);
    }
    async GetMailFromFolder(folderId: string, limit: number, offset: number): Promise<Array<Mail>> {
        await this.refreshAccessToken();
        return GetMailsFromFolder(folderId, limit, offset, this.accessToken);
    }
    async GetMailSettings(): Promise<MailSettings> {
        await this.refreshAccessToken();
        return GetMailSettings(this.userId, this.accessToken);
    }
    async GetNews(): Promise<Array<News>> {
        await this.refreshAccessToken();
        return GetSchoolNews(this.accessToken);
    }
    async GetTimetable(periodStart?: Date, periodEnd?: Date): Promise<Array<TimetableDay>> {
        await this.refreshAccessToken();
        return getTimetableForPeriods(this.refreshURL, this.userId, this.accessToken, this.SMSCMobileID ?? "", periodStart ?? undefined, periodEnd ?? undefined);
    }
    async initKids(kids: Array<KidData>): Promise<void> {
        if (this.kind === Kind.PARENT) {
            this.kids = kids.map(kid => new SmartSchool(
                this.accessToken,
                this.refreshToken,
                this.refreshURL,
                this.accessTokenTTL,
                kid.id,
                kid.firstName,
                kid.lastName,
                kid.className,
                "",
                new Date(kid.dateOfBirth),
                Kind.STUDENT,
                this.SMSCMobileID
            ));
        }
    }


    async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) {
            throw new Error("No refresh token available. Please authenticate again.");
        }
        const response = await OIDCRefresh(this.refreshURL, this.refreshToken);
        console.log("Refreshed access token");
        if (!response.access_token || !response.refresh_token) {
            throw new Error("Failed to refresh access token.");
        }
        console.log("New access token: ", response.access_token);
        console.log("New refresh token: ", response.refresh_token);
        this.accessToken = response.access_token;
        this.refreshToken = response.refresh_token;
        return true;
    }


    async SendMail(subject: string, content: string, recipients?: Array<Recipients>, cc?: Array<Recipients>, bcc?: Array<Recipients>): Promise<Mail> {
        await this.refreshAccessToken();
        return SendMail(subject, content, recipients, cc, bcc, this.accessToken);
    }


}
