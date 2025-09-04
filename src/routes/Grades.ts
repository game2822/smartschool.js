import { BASE_URL, USER_LAST_GRADES, USER_SERVICES } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { Grade } from "../structures/Grade";
import { Period } from "../structures/Period";
import { SkillLevel } from "../structures/SkillLevel";
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
    periodIncluded,
    skillColorsIncluded,
    skillsIncluded
} from "../types/Grades";
import { BaseDataResponse, BaseResponse } from "../types/RequestHandler";
import { getMultipleRelations, getSingleRelation } from "../util/Relations";

const manager = new RestManager(BASE_URL());

export const GetGradesSettings = async (
    userId: string,
    accessToken: string
): Promise<GradesSettings> => {
    const response = await manager.get<BaseResponse>(USER_LAST_GRADES(), {
        "filter[student.id]":             userId,
        "include":                        "periods,skillsSetting,skillsSetting.skillAcquisitionColors",
        "fields[evaluationsSetting]":     "periodicReportsEnabled,skillsEnabled,evaluationsDetailsAvailable",
        "fields[period]":                 "label,startDate,endDate",
        "fields[skillsSetting]":          "skillAcquisitionLevels,skillAcquisitionColors",
        "fields[skillAcquisitionColors]": "colorLevelMappings"
    }, {
        Authorization: `Bearer ${accessToken}`
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    const data: BaseDataResponse<"evaluationsSetting", GradesSettingsAttributes> | undefined =
        Array.isArray(response.data)
            ? (response.data[0] as unknown as BaseDataResponse<"evaluationsSetting", GradesSettingsAttributes>)
            : (response.data as unknown as BaseDataResponse<"evaluationsSetting", GradesSettingsAttributes>);

    const periods: Array<Period> = getMultipleRelations(data.relationships.periods).map(period => {
        const periodInclude = includedMap.get(`period:${period.id}`) as periodIncluded;
        return new Period(
            period.id,
            periodInclude.attributes?.label ?? "",
            new Date(periodInclude.attributes?.startDate ?? ""),
            new Date(periodInclude.attributes?.endDate ?? "")
        );
    });

    const skillLevelsRelation = getSingleRelation(data.relationships.periods);
    const skillLevelsId = typeof skillLevelsRelation?.id === "string" ? skillLevelsRelation.id : "";
    const skillLevelsIncluded = skillLevelsId ? includedMap.get(`skillsSetting:${skillLevelsId}`) as skillsIncluded : undefined;
    const skillLevels: Array<SkillLevel> = skillLevelsIncluded?.attributes?.skillAcquisitionLevels
        ? skillLevelsIncluded.attributes.skillAcquisitionLevels.map(skillLevel => {
            const colorRelation = getSingleRelation(skillLevelsIncluded.relationships?.skillAcquisitionColors);
            const colorId = typeof colorRelation?.id === "string" ? colorRelation.id : "";
            const colors = colorId ? includedMap.get(`skillAcquisitionColors:${colorId}`) as skillColorsIncluded : undefined;
            const color = colors?.attributes?.colorLevelMappings.find(col => col.level === skillLevel.level);
            return new SkillLevel(skillLevel.label, skillLevel.shortLabel, skillLevel.level, color?.color);
        })
        : [];

    return {
        periodicReportsEnabled:      data?.attributes?.periodicReportsEnabled ?? false,
        skillsEnabled:               data?.attributes?.skillsEnabled ?? false,
        evaluationsDetailsAvailable: data?.attributes?.evaluationsDetailsAvailable ?? false,
        periods,
        skillLevels
    };
};

export const GetLastGrades = async (
    userId: string,
    accessToken: string,
    limit = 20,
    offset = 0
): Promise<Array<Grade>> => {
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

export const GetGradesForPeriod = async (
    userId: string,
    accessToken: string,
    period: string
): Promise<Array<Subject>> => {
    const response = await manager.get<BaseResponse>(USER_SERVICES(), {
        "filter[student.id]":               userId,
        "filter[period.id]":                period,
        "include":                          "subject,evaluations,evaluations.evaluationResult,evaluations.evaluationResult.subSkillsEvaluationResults,evaluations.evaluationResult.subSkillsEvaluationResults.subSkill,evaluations.subSkills,teachers",
        "fields[evaluationService]":        "coefficient,average,studentAverage,scale",
        "fields[subject]":                  "label,color",
        "fields[evaluation]":               "dateTime,coefficient,average,scale,evaluationResult,subSkills",
        "fields[evaluationResult]":         "mark,nonEvaluationReason,subSkillsEvaluationResults",
        "fields[subSkillEvaluationResult]": "level,subSkill",
        "fields[teacher]":                  "firstName,lastName,title",
        "fields[subSkill]":                 "shortLabel"
    }, {
        Authorization: `Bearer ${accessToken}`
    });

    const includedMap = new Map<string, unknown>();
    for (const item of response.included ?? []) {
        includedMap.set(`${item.type}:${item.id}`, item);
    }

    return (Array.isArray(response.data) ? response.data : [])
        .filter((item): item is BaseDataResponse<"evaluationService", GradesServiceAttribute> => item.type === "evaluationService")
        .map(subject => {
            const teachers: Array<Teacher> = [];
            const teachersId = getMultipleRelations(subject.relationships.teachers);
            for (const teacher of teachersId) {
                const teacherData = includedMap.get(`teacher:${teacher.id}`) as teacherIncluded;
                teachers.push({
                    id:        teacher.id,
                    name:      teacherData.attributes?.firstName ?? "",
                    photoUrl:  teacherData.attributes?.photoUrl ?? "",
                    title:     teacherData.attributes?.title ?? ""
                });
            }

            const grades: Array<Grade> = [];
            const gradesId = getMultipleRelations(subject.relationships.evaluations);
            for (const grade of gradesId) {
                const gradeData = includedMap.get(`evaluation:${grade.id}`) as gradesIncluded;
                const gradeResultId = getSingleRelation(gradeData.relationships?.evaluationResult)?.id;
                const gradeResult = gradeResultId ? includedMap.get(`evaluationResult:${gradeResultId}`) as gradeResultIncluded : undefined;
                grades.push(new Grade(
                    grade.id,
                    gradeResult?.attributes?.nonEvaluationReason ? false : true,
                    gradeResult?.attributes?.mark ?? 0,
                    gradeData.attributes?.scale ?? 20,
                    new Date(gradeData.attributes?.dateTime ?? ""),
                    gradeData.attributes?.coefficient ?? 1,
                    undefined,
                    undefined,
                    undefined
                ));
            }
            const subjectId = getSingleRelation(subject.relationships.subject);
            const subjectKey = typeof subjectId?.id === "string" ? subjectId.id : "";
            const subjectData = includedMap.get(`subject:${subjectKey}`) as subjectIncluded;
            return new Subject(
                subject.id,
                subjectData.attributes?.label ?? "",
                subject.attributes?.coefficient ?? 1,
                subject.attributes?.studentAverage ?? 10,
                subject.attributes?.scale ?? 20,
                subject.attributes?.average ?? 10,
                grades,
                teachers
            );
        });
};
