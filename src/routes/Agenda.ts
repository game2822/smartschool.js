import { USER_AGENDA } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Assignment } from "../structures/Assignment";
import { Lesson } from "../structures/Lesson";
import { TimetableDay } from "../structures/TimetableDay";
import { Teacher } from "../types/Assignment";
import { BaseResponse } from "../types/RequestHandler";

export const getTimetableForPeriods = async (url: string, userId: string, accessToken: string, deviceId: string, periodStart = new Date(), periodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1)), limit = 50): Promise<Array<TimetableDay>> => {
    const manager = new RestManager(url);
    const formatDate = (date: Date): string =>
        date.toISOString();

    const response = await manager.get<BaseResponse>(USER_AGENDA(userId), {
        from:  formatDate(periodStart),
        to:    formatDate(periodEnd),
        types: "planned-lessons"
    }, {
        Authorization: `Bearer ${accessToken}`,
        SmscMobileId:  deviceId
    });
    console.log("API Response:", response);
    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    const result: Array<TimetableDay> = [];
    if (!Array.isArray(response)) {
        console.error("Response is not an array:", response);
        return [];
    }
    for (const rawLesson of response) {
        const teachers: Array<Teacher> = [];
        for (const organisers of rawLesson.organisers?.users ?? []) {
            teachers.push({
                id:        organisers.id,
                title:     "",
                firstName: organisers.firstName ?? "",
                lastName:  organisers.lastName ?? "",
                photoUrl:  organisers.photoUrl ?? ""
            });
        }

        const lessons: Array<Lesson> = [];
        lessons.push(new Lesson(
            rawLesson.id,
            new Date(rawLesson.period?.dateTimeFrom ?? ""),
            new Date(rawLesson.period?.dateTimeTo ?? ""),
            rawLesson.locations?.[0]?.title ?? "",
            false,
            false,
            false,
            false,
            {
                id:    rawLesson.courses?.[0].id ?? "",
                label: rawLesson.courses?.[0].title ?? "",
                color: rawLesson.courses?.[0].color ?? ""
            },
            teachers
        ));
        const assignments: Array<Assignment> = [];

        result.push(new TimetableDay(
            new Date(rawLesson.period?.dateTimeFrom ?? ""),
            lessons,
            assignments
        ));
    }
    return result;
};
