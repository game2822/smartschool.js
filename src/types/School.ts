import { BaseIncluded } from "./RequestHandler";
import { Services } from "../util/Constants";

export type schoolIncluded = BaseIncluded<"school", {
    subscribedServices: Array<Services>;
    administrativeId: string;
    schoolAudience: SchoolAudience;
}>;


export interface SchoolAudience {
    enabled: boolean;
    audienceId: string;
    projectId: string;
}
