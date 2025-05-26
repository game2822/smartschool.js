import { BaseIncluded, RelationshipData } from "./RequestHandler";
import { AttendanceItemState, AttendanceItemType } from "../util/Constants";

export type absenceFileStateIncluded = BaseIncluded<
"absenceFileState",
{
    creationDateTime: string;
    absenceStartDateTime: string;
    absenceEndDateTime: string;
    absenceType: AttendanceItemType;
    absenceFileStatus: AttendanceItemState;
},
{
    absenceReason: RelationshipData<"absenceReason">;
}
>;

export type absenceReasonIncluded = BaseIncluded<
"absenceReason",
{
    code: string;
    longLabel: string;
}
>;
