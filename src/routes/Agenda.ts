import { USER_AGENDA } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Assignment } from "../structures/Assignment";
import { Lesson } from "../structures/Lesson";
import { TimetableDay } from "../structures/TimetableDay";
import { Teacher } from "../types/Assignment";
import { BaseResponse } from "../types/RequestHandler";
import { extractBaseUrl } from "../util/URL";

export const getTimetableForPeriods = async (url: string, userId: string, accessToken: string, deviceId: string, periodStart = new Date(), periodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1)), limit = 50): Promise<Array<TimetableDay>> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);
    const formatDate = (date: Date): string =>
        date.toISOString();

    const response = await manager.get<BaseResponse>(USER_AGENDA(userId), {
        from:  formatDate(periodStart),
        to:    formatDate(periodEnd),
        types: "planned-placeholders,planned-lessons"
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
    // Add a type for rawLesson to avoid unsafe any access
    interface RawLesson {
        id: string;
        period?: {
            dateTimeFrom?: string;
            dateTimeTo?: string;
        };
        organisers?: {
            users?: Array<{
                id: string;
            }>;
        };
        locations?: Array<{
            title?: string;
        }>;
        courses?: Array<{
            id?: string;
            name?: string;
            color?: string;
        }>;
    }

    for (const rawLesson of response as Array<RawLesson>) {

        const teachers: Array<Teacher> = [];
        for (const organisers of rawLesson.organisers?.users ?? []) {
            teachers.push({
                id:        organisers.id,
                title:     "test",
                firstName: "test",
                lastName:  "test",
                photoUrl:  "test"
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
                id:    rawLesson.courses?.[0]?.id ?? "",
                label: rawLesson.courses?.[0]?.name ?? "",
                color: rawLesson.courses?.[0]?.color ?? "#000000"
            },
            teachers
        ));
        const assignments: Array<Assignment> = [
            // Mock data for now
            new Assignment(
                accessToken ?? "",
                userId ?? "",
                "1",
                false,
                "test homework",
                "<p>Complete the exercises on page 42</p>",
                new Date("2025-09-05"),
                false,
                null,
                {
                    id:    "1",
                    label: "Math",
                    color: "#FF0000"
                }
            )
        ];

        result.push(new TimetableDay(
            new Date(rawLesson.period?.dateTimeFrom ?? ""),
            lessons,
            assignments
        ));
    }
    return result;
};
