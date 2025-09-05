import { url } from "inspector";
import { GRADES_COURSES, USER_GRADES_SETTINGS, USER_LAST_GRADES, USER_SERVICES } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Grade } from "../structures/Grade";
import { Period } from "../structures/Period";
import { Subject } from "../structures/Subject";
import { subjectIncluded, Teacher, teacherIncluded } from "../types/Assignment";
import {
    gradeResultIncluded,
    GradesAttributes,
    gradesIncluded,
    GradesServiceAttribute,
    gradesServiceIncluded,
    GradesSettings,
    GradesSettingsAttributes,
} from "../types/Grades";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { getMultipleRelations, getSingleRelation } from "../util/Relations";
import { extractBaseUrl } from "../util/URL";


export const GetGradesSettings = async (
    url: string,
    deviceId: string,
    accessToken: string
): Promise<GradesSettings> => {
    const [base] = extractBaseUrl(url);

    const manager = new RestManager(base);
    const response = await manager.get<BaseResponse>(USER_GRADES_SETTINGS(),
    undefined,
    {
        Authorization: `Bearer ${accessToken}`,
        "SmscMobileId":  deviceId
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    const data: BaseDataResponse<"evaluationsSetting", GradesSettingsAttributes> | undefined =
        Array.isArray(response.data)
            ? (response.data[0] as unknown as BaseDataResponse<"evaluationsSetting", GradesSettingsAttributes>)
            : (response.data as unknown as BaseDataResponse<"evaluationsSetting", GradesSettingsAttributes>);

    const periods: Array<Period> = (Array.isArray(response) ? response : []).map(period =>
        new Period(
            period.id,
            period.name ?? "",
            new Date(period.skoreWorkYear?.dateRange?.start ?? ""),
            new Date(period.skoreWorkYear?.dateRange?.end ?? "")
        )
    );

    return {
        periodicReportsEnabled:      data?.attributes?.periodicReportsEnabled ?? false,
        skillsEnabled:               data?.attributes?.skillsEnabled ?? false,
        evaluationsDetailsAvailable: data?.attributes?.evaluationsDetailsAvailable ?? false,
        periods
    };
};

export const GetLastGrades = async (
    userId: string,
    accessToken: string,
    limit = 20,
    offset = 0
): Promise<Array<Grade>> => {
        const manager = new RestManager(USER_GRADES_SETTINGS());

    const response = await manager.get<BaseResponse>(USER_LAST_GRADES(), {
        "page[limit]":                      limit,
        "page[offset]":                     offset,
        "filter[student.id]":               userId,
        "include":                          "evaluation,evaluation.evaluationService,evaluation.evaluationService,evaluation.subSubject,evaluation.evaluationService.subject,subSkillsEvaluationResults",
        "fields[evaluationResult]":         "mark,nonEvaluationReason,evaluation,subSkillEvaluationResult",
        "fields[subSkillEvaluationResult]": "level",
        "fields[evaluation]":               "dateTime,topic,title,scale,evaluationService,subSubject",
        "fields[subSubject]":               "label",
        "fields[evaluationService]":        "subject",
        "fields[subject]":                  "label,color"
    }, {
        Authorization: `Bearer ${accessToken}`
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"evaluationResult", GradesAttributes> => item.type === "evaluationResult")
        .map(grade => {
            const evaluationId = getSingleRelation(grade.relationships.evaluation);
            const evaluationKey = typeof evaluationId?.id === "string" ? evaluationId.id : "";
            const evaluationInclude = includedMap.get(`evaluation:${evaluationKey}`) as gradesIncluded;
            const evaluationServiceId = getSingleRelation(evaluationInclude.relationships!.evaluationService);
            const evaluationServiceKey = evaluationServiceId && typeof evaluationServiceId.id === "string" ? evaluationServiceId.id : "";
            const evaluationServiceIncluded = includedMap.get(`evaluationService:${evaluationServiceKey}`) as gradesServiceIncluded;
            const subjectId = getSingleRelation(evaluationServiceIncluded?.relationships?.subject);
            const subjectKey = typeof subjectId?.id === "string" ? subjectId.id : "";
            const subjectData = includedMap.get(`subject:${subjectKey}`) as subjectIncluded;
            console.log(subjectId, subjectKey, subjectData);

            return new Grade(
                grade.id,
                grade.attributes?.nonEvaluationReason ? false : true,
                grade.attributes?.mark ?? 20,
                evaluationInclude.attributes?.scale ?? 0,
                new Date(evaluationInclude.attributes?.dateTime ?? ""),
                evaluationInclude.attributes?.coefficient ?? 1,
                evaluationInclude.attributes?.title ?? "",
                evaluationInclude.attributes?.topic ?? "",
                {
                    id:    subjectKey,
                    label: subjectData?.attributes?.label ?? "",
                    color: subjectData?.attributes?.color ?? ""
                },
                grade.attributes?.nonEvaluationReason ?? undefined
            );
        });
};

export const GetSubjects = async (
    url: string,
    deviceId: string,
    accessToken: string
): Promise<Array<Subject>> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);

    const response = await manager.get<BaseResponse>(
        GRADES_COURSES(),
        undefined,
        {
            Authorization: `Bearer ${accessToken}`,
            "SmscMobileId":  deviceId
        }
    );

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response) ? response : [])
        .filter((item): item is any => !item.parentCourseId)
        .map(subject => {
            interface TeacherData {
                id: string;
                name?: {
                    startingWithLastName?: string;
                };
                pictureUrl?: string;
            }

            const teachers: Array<Teacher> = (subject.teachers as TeacherData[] ?? []).map((teacherData: TeacherData): Teacher => ({
                id: teacherData.id,
                name: teacherData.name?.startingWithLastName ?? "",
                photoUrl: teacherData.pictureUrl ?? "",
                title: ""
            }));
            return new Subject(
                subject.id,
                subject.name ?? "",
                1,
                0,
                0,
                0,
                teachers,
            );
        });
}

export const GetGradesForPeriod = async (
    url: string,
    deviceId: string,
    accessToken: string,
    period: string
): Promise<Array<Subject>> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);

    const response = await manager.get<BaseResponse>(
        USER_SERVICES(period), 
        undefined, 
        {
            Authorization: `Bearer ${accessToken}`,
            "SmscMobileId":  deviceId
        }
    );

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response) ? response : [])
        .map(subject => {
            interface TeacherData {
                id: string;
                name?: {
                    startingWithLastName?: string;
                };
                pictureUrl?: string;
            }

            const teachers: Array<Teacher> = (subject.teachers as TeacherData[] ?? []).map((teacherData: TeacherData): Teacher => ({
                id: teacherData.id,
                name: teacherData.name?.startingWithLastName ?? "",
                photoUrl: teacherData.pictureUrl ?? "",
                title: ""
            }));

            const grades: Array<Grade> = [];
            const gradesArray = Array.isArray(response) ? response : [];
            for (const grade of gradesArray) {
                const outOf = (grade?.graphic.description).split("/")[1];
                const value = ((grade?.graphic.description ?? "").split("/")[0] ?? "").trim();
                grades.push(new Grade(
                    grade.identifier,
                    grade?.doesCount ? false : true,
                    value ?? 0,
                    outOf ?? 20,
                    new Date(grade?.date ?? ""),
                    1,
                    undefined,
                    undefined,
                    undefined
                ));
            }
            return new Subject(
                subject.courses[0]?.id,
                subject.courses[0]?.name ?? "",
                1,
                10,
                20,
                10,
                teachers,
                grades
            );
        });
}
