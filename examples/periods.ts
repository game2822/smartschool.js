process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import fs from "fs";
import dotenv from "dotenv";
import { GetGradesSettings } from "../src/routes/Grades";
import { LoginWithToken } from "../src";

dotenv.config();

const main = async () => {
    try {
        const url = process.env.INSTANCE_URL ?? "";
        const refreshToken = process.env.REFRESH_TOKEN ?? "";
        const SMSCMobileID = process.env.SMSCMobileID ?? "";

        if (!url || !refreshToken || !SMSCMobileID) {
            throw new Error("Missing required environment variables: INSTANCE_URL, REFRESH_TOKEN, SMSCMobileID");
        }

        console.log("Refreshing token...");
        const data = await LoginWithToken(url, refreshToken, SMSCMobileID);
        const token = data.accessToken;
        const deviceId = data.SMSCMobileID;
        console.log("Token refreshed successfully.");

        console.log("\nFetching grades settings / periods with GetGradesSettings...");
        const gradesSettings = await GetGradesSettings(url, deviceId, token);

        fs.writeFileSync("grades-settings.json", JSON.stringify(gradesSettings, null, 2));

        console.log("\nGetGradesSettings response:");
        console.log(JSON.stringify(gradesSettings, null, 2));

        console.log("\nPeriods:");
        console.log(JSON.stringify(gradesSettings.periods ?? [], null, 2));
    } catch (error) {
        console.error("\nAn error occurred while fetching grades settings / periods:");
        console.error(error);
    }
};

main();
