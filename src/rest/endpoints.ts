/** REST/Endpoints */
export const BASE_URL = () => "https://api.skolengo.com/api/v1/bff-sko-app";

export const SEARCH_SCHOOLS = () => "schools";
export const SCHOOL_NEWS = () => "schools-info";

export const USER_INFO = (userId: string) => "users-info/" + userId;
export const USER_ASSIGNMENT = (id: string, userId: string, completed: string) => "planner/api/v1/planned-assignments/"+ userId.split("_")[0] + "/" + id + "/" + completed;
export const USER_AGENDA = (userId: string) => "planner/api/v1/planned-elements/user/" + userId;
export const USER_GRADES_SETTINGS = () => "results/api/v1/periods/";
export const GRADES_COURSES = () => "results/api/v1/courses/";
export const USER_LAST_GRADES = () => "evaluations-results";
export const USER_SERVICES = (periodId: string) => "results/api/v1/evaluations/?pageNumber=1&itemsOnPage=999&periodIds=" + periodId;
export const InstanceValidation = () => "OAuth/verifyplatform";
export const OIDC_TOKEN_PATH = () => "OAuth/mobile/token";
export const REGISTER_DEVICE_PATH = () => "OAuth/mobile/register";

export const ATTENDANCE_FILES = () => "absence-files";

export const MAIL = () => "communications";
export const MAIL_PARTICIPATIONS = (mailId: string) => "communications/" + mailId + "/participations";
export const MAIL_SETTINGS = (userId: string) => "users-mail-settings/" + userId;
