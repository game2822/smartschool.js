/** REST/Endpoints */
export const BASE_URL = () => "https://api.skolengo.com/api/v1/bff-sko-app";

export const SEARCH_SCHOOLS = () => "schools";
export const SCHOOL_NEWS = () => "schools-info";

export const USER_INFO = (userId: string) => "users-info/" + userId;
export const USER_ASSIGNMENTS = () => "homework-assignments";
export const USER_ASSIGNMENT = (id: string) => "homework-assignments/" + id;
export const USER_AGENDA = (userId: string) => "planner/api/v1/planned-elements/user/" + userId;
export const USER_GRADES_SETTINGS = () => "evaluations-settings";
export const USER_LAST_GRADES = () => "evaluations-results";
export const USER_SERVICES = () => "evaluation-services"
export const InstanceValidation = () => "OAuth/verifyplatform";

export const ATTENDANCE_FILES = () => "absence-files";

export const MAIL = () => "communications";
export const MAIL_PARTICIPATIONS = (mailId: string) => "communications/" + mailId + "/participations";
export const MAIL_SETTINGS = (userId: string) => "users-mail-settings/" + userId;
