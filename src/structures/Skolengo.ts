import { School } from "./School";
import { News } from "./News";
import { Assignment } from "./Assignment";
import { AttendanceItem } from "./AttendanceItem";
import { TimetableDay } from "./TimetableDay";
import { Grade } from "./Grade";
import { Subject } from "./Subject";
import { Kind, Permissions } from "../util/Constants";
import { GetSchoolNews } from "../routes/School";
import { GetAssignments } from "../routes/Assignments";
import { GetAttendanceItems } from "../routes/Attendance";
import { getTimetableForPeriods } from "../routes/Agenda";
import { GradesSettings } from "../types/Grades";
import { GetGradesForPeriod, GetGradesSettings, GetLastGrades } from "../routes/Grades";

export class Skolengo {
    constructor(
        protected accessToken: string,
        protected refreshToken: string,
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

    async GetAssignments(periodStart?: Date, periodEnd?: Date): Promise<Array<Assignment>> {
        return GetAssignments(this.userId, this.accessToken, this.school.emsCode, this.school.id, periodStart, periodEnd);
    }

    async GetAttendanceItems(): Promise<Array<AttendanceItem>> {
        return GetAttendanceItems(this.userId, this.school.id, this.school.emsCode, this.accessToken);
    }
    async GetGradesForPeriod(period?: string): Promise<Array<Subject>> {
        const periods = [];
        if (!period) {
            periods.push(...(await this.GetGradesSettings()).periods);
            if (!periods[0]) throw new Error("We are unable to find any periods.");
        }
        return GetGradesForPeriod(this.userId, this.accessToken, this.school.emsCode, this.school.id, period ?? periods[0].id);
    }
    async GetGradesSettings(): Promise<GradesSettings> {
        return GetGradesSettings(this.userId, this.accessToken, this.school.emsCode, this.school.id);
    }
    async GetLastGrades(limit?: number, offset?: number): Promise<Array<Grade>> {
        return GetLastGrades(this.userId, this.accessToken, this.school.emsCode, this.school.id, limit, offset);
    }

    async GetNews(): Promise<Array<News>> {
        return GetSchoolNews(this.accessToken, this.school.emsCode);
    }
    async GetTimetable(periodStart?: Date, periodEnd?: Date): Promise<Array<TimetableDay>> {
        return getTimetableForPeriods(this.userId, this.school.id, this.school.emsCode, this.accessToken, periodStart, periodEnd);
    }
}
