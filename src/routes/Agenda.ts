import { BASE_URL, USER_AGENDA } from "../rest/Endpoints";
import { RestManager } from "../rest/RESTManager";
import { Assignment } from "../structures/Assignment";
import { Lesson } from "../structures/Lesson";
import { TimetableDay } from "../structures/TimetableDay";
import { AgendaAttributes, lessonIncluded } from "../types/Agenda";
import { homeworkIncluded, subjectIncluded, Teacher, teacherIncluded } from "../types/Assignment";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { getMultipleRelations, getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const getTimetableForPeriods = async (userId: string, schoolId: string, emsCode: string, accessToken: string, periodStart = new Date(), periodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1)), limit = 50): Promise<Array<TimetableDay>> => {
    const formatDate = (date: Date): string =>
        date.toISOString().slice(0, 10);

    const response = await manager.get<BaseResponse>(USER_AGENDA(), {
        "filter[student.id]":      userId,
        "filter[date][GE]":        formatDate(periodStart),
        "filter[date][LE]":        formatDate(periodEnd),
        "include":                 "lessons,lessons.subject,lessons.teachers,homeworkAssignments,homeworkAssignments.subject",
        "fields[lesson]":          "title,startDateTime,endDateTime,location,canceled,anyContent,anyHomeworkToDoForTheLesson,anyHomeworkToDoAfterTheLesson,subject,teachers",
        "fields[homework]":        "title,done,dueDateTime,subject,html,deliverWorkOnline, onlineDeliverUrl",
        "fields[cateringService]": "title,startDateTime,endDateTime",
        "fields[teacher]":         "firstName,lastName,title",
        "fields[subject]":         "label,color",
        "page[limit]":             limit
    }, {
        "Authorization":        `Bearer ${accessToken}`,
        "x-skolengo-ems-code":  emsCode,
        "x-skolengo-school-id": schoolId
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    const result: Array<TimetableDay> = [];
    const days = response.data as Array<BaseDataResponse<"agenda", AgendaAttributes>>;

    for (const day of days) {
        const lessons: Array<Lesson> = [];
        const rawLessons = getMultipleRelations(day.relationships.lessons);

        const assignments: Array<Assignment> = [];
        const assignmentsIds = getMultipleRelations(day.relationships.homeworkAssignments);

        for (const assignment of assignmentsIds) {
            const assignmentData = includedMap.get("homework:" + assignment.id) as homeworkIncluded;
            const assignmentSubjectId = getSingleRelation(assignmentData.relationships?.subject)?.id;
            const assignmentSubject = assignmentSubjectId ? includedMap.get("subject:" + assignmentSubjectId) as subjectIncluded : null;
            assignments.push(new Assignment(
                accessToken,
                userId,
                schoolId,
                emsCode,
                assignment.id,
                assignmentData.attributes?.done ?? false,
                assignmentData.attributes?.title ?? "",
                assignmentData.attributes?.html ?? "",
                new Date(assignmentData.attributes?.dueDateTime ?? ""),
                assignmentData.attributes?.deliverWorkOnline ?? false,
                assignmentData.attributes?.onlineDeliverUrl ?? "",
                {
                    id:    assignmentSubjectId ?? "",
                    label: assignmentSubject?.attributes?.label ?? "",
                    color: assignmentSubject?.attributes?.color ?? ""
                }));
        }
        for (const rawLesson of rawLessons) {
            const lesson = rawLesson.id ? includedMap.get("lesson:" + rawLesson.id) as lessonIncluded : null;

            const subjectId = getSingleRelation(lesson?.relationships?.subject)?.id;
            const subject = subjectId ? includedMap.get("subject:" + subjectId) as subjectIncluded : null;

            const teachers: Array<Teacher> = [];
            const teachersIds = getMultipleRelations(lesson?.relationships?.teachers);
            for (const teacher of teachersIds) {
                const teacherData = includedMap.get("teacher:" + teacher.id) as teacherIncluded;
                teachers.push({
                    id:        teacher.id,
                    title:     teacherData.attributes?.title ?? "",
                    firstName: teacherData.attributes?.firstName ?? "",
                    lastName:  teacherData.attributes?.lastName ?? "",
                    photoUrl:  teacherData.attributes?.photoUrl ?? ""
                });
            }
            lessons.push(new Lesson(
                rawLesson.id,
                new Date(lesson?.attributes?.startDateTime ?? ""),
                new Date(lesson?.attributes?.endDateTime ?? ""),
                lesson?.attributes?.location ?? "",
                lesson?.attributes?.canceled ?? false,
                lesson?.attributes?.anyContent ?? false,
                lesson?.attributes?.anyHomeworkToDoForTheLesson ?? false,
                lesson?.attributes?.anyHomeworkToDoAfterTheLesson ?? false,
                {
                    id:    subject?.id ?? "",
                    label: subject?.attributes?.label ?? "",
                    color: subject?.attributes?.color ?? ""
                },
                teachers
            ));
        }

        result.push(new TimetableDay(
            new Date(day.attributes?.date ?? ""),
            lessons,
            assignments
        ));
    }

    return result;
};
