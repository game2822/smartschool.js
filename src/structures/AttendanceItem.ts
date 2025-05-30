import { AttendanceItemState, AttendanceItemType } from "../util/Constants";

export class AttendanceItem {
    constructor(
        public id: string,
        public creationDate: Date,
        public startDate: Date,
        public endDate: Date,
        public type: AttendanceItemType,
        public state: AttendanceItemState,
        public reason: string
    ){}
}
