import { ATTENDANCE_FILES, BASE_URL } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { AttendanceItem } from "../structures/AttendanceItem";
import { absenceFileStateIncluded, absenceReasonIncluded } from "../types/Attendance";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { AttendanceItemState, AttendanceItemType } from "../util/Constants";
import { getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const GetAttendanceItems = async (userId: string, accessToken: string): Promise<Array<AttendanceItem>> => {
    const response = await manager.get<BaseResponse>(ATTENDANCE_FILES(), {
        "filter[student.id]":               userId,
        "filter[currentState.absenceType]": "ABSENCE,CLATENESS",
        "filter[absenceFile]":              "currentState",
        "include":                          "currentState,currentState.absenceReason,currentState.absenceRecurrence",
        "fields[absenceFileState]":         "creationDateTime,absenceStartDateTime,absenceEndDateTime,absenceType,absenceFileStatus,absenceReason,absenceRecurrence",
        "fields[absenceReason]":            "code,longLabel"
    }, {
        Authorization: `Bearer ${accessToken}`
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"absenceFile"> => item.type === "absenceFile")
        .map(absenceItem => {
            const fileId = getSingleRelation(absenceItem.relationships.currentState)?.id;
            const file = fileId ? includedMap.get("absenceFileState:" + fileId) as absenceFileStateIncluded : null;
            const reasonId = getSingleRelation(file?.relationships?.absenceReason)?.id;
            const reason = reasonId ? includedMap.get("absenceReason:" + reasonId) as absenceReasonIncluded : null;
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
