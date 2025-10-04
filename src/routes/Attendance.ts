import { ATTENDANCE_FILES, BASE_URL } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { AttendanceItem } from "../structures/AttendanceItem";
import { absenceFileStateIncluded, absenceReasonIncluded } from "../types/Attendance";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { ATTENDANCE_CODE_MAP, ATTENDANCE_STATE_MAP, AttendanceItemState, AttendanceItemType } from "../util/Constants";
import { getSingleRelation } from "../util/Relations";
import { extractBaseUrl } from "../util/URL";


function parseDate(date: string): Date {
    const clean = date.replace(/^\w+\.\s*/, "")
    const months: Record<string, number> = {
        "janvier":   0, "février":   1, "mars":      2,
        "avril":     3, "mai":       4, "juin":      5,
        "juillet":   6, "août":      7, "septembre": 8,
        "octobre":   9, "novembre":  10, "décembre":  11
    };
    const match = clean.match(/^(\d{1,2}) (\w+) (\d{4})$/);
    if (!match) {
        throw new Error(`Invalid date format: ${date}`);
    }
    const [, day, month, year] = match;
    const monthIndex = months[month.toLowerCase()];
    if (monthIndex === undefined) {
        throw new Error(`Invalid month name: ${month}`);
    }
    return new Date(Number(year), monthIndex, Number(day));
}

export const GetAttendanceItems = async (url:string, userId: string, accessToken: string, mobileId: string): Promise<Array<AttendanceItem>> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);

    const body = new URLSearchParams(
        { pupilID: userId.split("_")[1] }
    );
    const responsetext = await manager.post<any>(
        ATTENDANCE_FILES(),
        body,
        undefined,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${accessToken}`,
                "Accept-Language": "fr",
                "SmscMobileId": mobileId
            }
    }, 
    true
);

    const response = JSON.parse(responsetext);
    const attendanceItems: Array<AttendanceItem> = [];

    const currentYear = response.year_label;
    const currentYearAttendance = response.presences?.[currentYear] || [];

    for (const attendance of currentYearAttendance) {
        const attendanceData = attendance.am || attendance.pm || attendance.full;
        
        if (attendanceData) {
            const date = parseDate(attendanceData.formattedDate);
            
            attendanceItems.push(new AttendanceItem(
                (attendanceItems.length + 1).toString(),
                date,
                new Date(date),
                new Date(date),
                ATTENDANCE_CODE_MAP[attendanceData.codeKey] || AttendanceItemType.ABSENCE,
                ATTENDANCE_STATE_MAP[attendanceData.codeKey] || AttendanceItemState.OPEN,
                attendanceData.motivation || attendanceData.codeDescr || ""
            ));
        }
    }
    return attendanceItems;
};