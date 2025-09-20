import { BASE_URL, OIDC_TOKEN_PATH, REGISTER_DEVICE_PATH, USER_INFO } from "../rest/endpoints";
import { RestManager } from "../rest/RESTManager";
import { SmartSchool } from "../structures/Smartschool";
import { DecodePayload } from "../util/JWT";
import { JWTPayload } from "../types/OIDC";
import { Kind } from "../util/Constants";
import { BaseResponse } from "../types/RequestHandler";
import { KidData, studentIncluded, UserAttributes } from "../types/User";
import { getMultipleRelations } from "../util/Relations";
import { log } from "console";
import { extractBaseUrl } from "../util/URL";


export const RegisterDevice = async (
    accessToken: string,
    refreshToken: string,
    url: string,
    deviceType: string,
    deviceName: string,
    deviceId: string
): Promise<SmartSchool> => {
    const [base] = extractBaseUrl(url);
    const manager = new RestManager(base);

    const headers = {
        Authorization: `Bearer ${accessToken}`
        };

    const body = {
        accessToken,
        deviceType,
        "deviceTitle": deviceName,
        deviceId
    };

    const response = await manager.post<BaseResponse>(
        REGISTER_DEVICE_PATH(),
        body,
        undefined,
        { headers }
    );

    if (Array.isArray(response)) {
        throw new TypeError("Expected a single user object in response data.");
    }
    const refreshURL = url + "/" + OIDC_TOKEN_PATH();
    const userInfo = response as unknown as { identifier: string; userLT: number; accountInfo: { user: { name: { startingWithFirstName: string; firstName: string; }; id: string; pictureUrl: string; }; }; config: (callback: (p: any) => any) => any; }; // je bypass le BaseResponse prcq flm de refaire les types a 4h du mat
    const kind = determineAccountKind(userInfo.userLT);
    const lastName = userInfo.accountInfo.user.name.startingWithFirstName
    .replace(userInfo.accountInfo.user.name.firstName, "")
    .trim();

//
//      Parent accounts will be implemented later
//
    /* const kids: Array<KidData> = [];
    if (kind === Kind.PARENT) {
        const kidId = getMultipleRelations(userInfo.relationships.students);
        if (kidId.length === 0) {
            throw new Error("No kids found for this parent.");
        }


        for (const kid of kidId) {
            const kidData = response.included.find(
                item => item.id === kid.id && item.type === "student"
            ) as studentIncluded;

            if (!kidData) {
                throw new Error(`Kid with ID ${kid.id} not found in response.`);
            }

            kids.push({
                id:          kidData.id,
                lastName:    kidData.attributes?.lastName ?? "",
                firstName:   kidData.attributes?.firstName ?? "",
                photoUrl:    kidData.attributes?.photoUrl ?? "",
                className:   kidData.attributes?.className ?? "",
                dateOfBirth: new Date(kidData.attributes?.dateOfBirth ?? ""),
            });
        }
    }*/
        
        const client = new SmartSchool(
        accessToken,
        refreshToken,
        refreshURL,
        5,
        userInfo.accountInfo.user.id,
        userInfo.accountInfo.user.name.firstName,
        lastName,
        "Class TEMP",
        "0600000000",
        new Date("2000-01-01"),
        kind,
        userInfo.identifier,
        userInfo.accountInfo.user.pictureUrl
        );

    return client;
};

function determineAccountKind(userLT: number): Kind {
    switch (userLT) {
        case 2: {
            return Kind.PARENT;
        }
        default: {
            return Kind.STUDENT;
        }
    }
}
