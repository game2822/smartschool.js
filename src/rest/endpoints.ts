/** REST/Endpoints */
export const BASE_URL = () => "https://api.skolengo.com/api/v1/bff-sko-app";

export const SEARCH_SCHOOLS = () => "schools";
export const SCHOOL_NEWS = () => "schools-info";

export const USER_INFO = (userId: string) => "users-info/" + userId;
export const USER_ASSIGNMENTS = () => "homework-assignments";
export const USER_ASSIGNMENT = (id: string) => "homework-assignments/" + id;

export const ATTENDANCE_FILES = () => "absence-files";
