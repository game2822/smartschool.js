import { ATTENDANCE_FILES, BASE_URL } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { AttendanceItem } from "../structures/AttendanceItem";
import { absenceFileStateIncluded, absenceReasonIncluded } from "../types/Attendance";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { AttendanceItemState, AttendanceItemType } from "../util/Constants";

const manager = new RestManager(BASE_URL());

export const GetAttendanceItems = async (userId: string, schoolId: string, emsCode: string, accessToken: string): Promise<Array<AttendanceItem>> => {
    const response = await manager.get<BaseResponse>(ATTENDANCE_FILES(), {
        "filter[student.id]":               userId,
        "filter[currentState.absenceType]": "ABSENCE,CLATENESS",
        "filter[absenceFile]":              "currentState",
        "include":                          "currentState,currentState.absenceReason,currentState.absenceRecurrence",
        "fields[absenceFileState]":         "creationDateTime,absenceStartDateTime,absenceEndDateTime,absenceType,absenceFileStatus,absenceReason,absenceRecurrence",
        "fields[absenceReason]":            "code,longLabel"
    }, {
        "Authorization":        `Bearer ${accessToken}`,
        "x-skolengo-ems-code":  emsCode,
        "x-skolengo-school-id": schoolId
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"absenceFile"> => item.type === "absenceFile")
        .map(absenceItem => {
            const file = absenceItem.relationships.currentState?.data.id ? includedMap.get("absenceFileState:" + absenceItem.relationships.currentState.data.id) as absenceFileStateIncluded : null;
            const reason = file?.relationships?.absenceReason.data.id ? includedMap.get("absenceReason:" + file.relationships.absenceReason.data.id) as absenceReasonIncluded : null;
            return new AttendanceItem(
                absenceItem.id,
                new Date(file?.attributes?.creationDateTime ?? ""),
                new Date(file?.attributes?.absenceStartDateTime ?? ""),
                new Date(file?.attributes?.absenceEndDateTime ?? ""),
                file?.attributes?.absenceType ?? AttendanceItemType.ABSENCE,
                file?.attributes?.absenceFileStatus ?? AttendanceItemState.OPEN,
                reason?.attributes?.longLabel ?? ""
            );
        });
};
