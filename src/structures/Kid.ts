import { Skolengo } from "./Skolengo";
import { School } from "./School";
import { TimetableDay } from "./TimetableDay";
import { Assignment } from "./Assignment";
import { Subject } from "./Subject";
import { Grade } from "./Grade";
import { AttendanceItem } from "./AttendanceItem";
import { getTimetableForPeriods } from "../routes/Agenda";
import { GetAssignments } from "../routes/Assignments";
import { GradesSettings } from "../types/Grades";
import { GetGradesForPeriod, GetGradesSettings, GetLastGrades } from "../routes/Grades";
import { Kind } from "../util/Constants";
import { GetAttendanceItems } from "../routes/Attendance";

export class Kid extends Skolengo {
    constructor(
        private parent: Skolengo,
        public override userId: string,
        public override lastName: string,
        public override firstName: string,
        public photoUrl: string | null,
        public override className: string,
        public override dateOfBirth: Date,
        public override regime: string,
        public override school: School
    ) {
        super(
            parent["accessToken"],
            parent["refreshToken"],
            parent["refreshURL"],
            parent["accessTokenTTL"],
            userId,
            firstName,
            lastName,
            className,
            "",
            dateOfBirth,
            regime,
            Kind.STUDENT,
            [],
            school
        );
    }

    override  async GetAssignments(periodStart?: Date, periodEnd?: Date): Promise<Array<Assignment>> {
        await this.refreshAccessToken();
        return GetAssignments(this.userId, this.accessToken, this.school.emsCode, this.school.id, periodStart, periodEnd);
    }
    override async GetAttendanceItems(): Promise<Array<AttendanceItem>> {
        await this.refreshAccessToken();
        return GetAttendanceItems(this.userId, this.school.id, this.school.emsCode, this.accessToken);
    }
    override async GetGradesForPeriod(period?: string): Promise<Array<Subject>> {
        await this.refreshAccessToken();
        const periods = [];
        if (!period) {
            periods.push(...(await this.GetGradesSettings()).periods);
            if (!periods[0]) throw new Error("We are unable to find any periods.");
        }
        return GetGradesForPeriod(this.userId, this.accessToken, this.school.emsCode, this.school.id, period ?? periods[0].id);
    }
    override async GetGradesSettings(): Promise<GradesSettings> {
        await this.refreshAccessToken();
        return GetGradesSettings(this.userId, this.accessToken, this.school.emsCode, this.school.id);
    }
    override async GetLastGrades(limit?: number, offset?: number): Promise<Array<Grade>> {
        await this.refreshAccessToken();
        return GetLastGrades(this.userId, this.accessToken, this.school.emsCode, this.school.id, limit, offset);
    }
    override async GetTimetable(periodStart?: Date, periodEnd?: Date): Promise<Array<TimetableDay>> {
        await this.refreshAccessToken();
        return getTimetableForPeriods(this.userId, this.school.id, this.school.emsCode, this.accessToken, periodStart, periodEnd);
    }


    override async refreshAccessToken(): Promise<boolean> {
        return this.parent.refreshAccessToken();
    }


}
