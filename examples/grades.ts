process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import readline from "readline";
import fs from "fs";
import dotenv from "dotenv";
import { getTimetableForPeriods } from "../src/routes/Agenda";
import { GetGradesSettings, GetGradesForPeriod, GetSubjects } from "../src/routes/Grades";
import { LoginWithToken } from "../src";

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

const main = async () => {
    try {
        const url = process.env.INSTANCE_URL ?? "";
        const refreshToken = process.env.REFRESH_TOKEN ?? "";
        const userId = process.env.USER_ID ?? "";

        // Refresh token and get device ID
        console.log("Refreshing token...");
        const data = await LoginWithToken(url, refreshToken, "android", "SmartSchool.js debug script", "1234567890");
        const token = data.accessToken;
        const deviceId = data.SMSCMobileID;
        console.log("Token refreshed successfully.");
        // Fetch periods
        console.log("\nFetching periods...");
        const gradesSettings = await GetGradesSettings(url, deviceId, token);
        const periods = gradesSettings.periods;

        if (!periods.length) {
            console.log("No periods found.");
            rl.close();
            return;
        }

        // List periods for user selection
        console.log("\nAvailable periods:");
        periods.forEach((period, idx) => {
            console.log(`${idx + 1}. ${period.id || period.label || period.startDate || period.endDate}`);
        });

        const periodIdxStr = await askQuestion("Select a period number to fetch grades: ");
        const periodIdx = parseInt(periodIdxStr, 10) - 1;
        if (isNaN(periodIdx) || periodIdx < 0 || periodIdx >= periods.length) {
            console.log("Invalid period selection.");
            rl.close();
            return;
        }
        const selectedPeriod = periods[periodIdx];

        // Fetch all the subjects to get their teachers
        console.log("\nFetching subjects to get teachers...");

        //console.log("Subjects:", Array.from(subjectsMap.values()).map(s => s.name).join(", "));


        // Fetch grades for the selected period
        //console.log(`\nFetching grades for period: ${selectedPeriod.label || selectedPeriod.startDate || selectedPeriod.endDate || selectedPeriod.id}...`);
        const grades = await GetGradesForPeriod(url, deviceId, token, selectedPeriod.id);

        fs.writeFileSync("grades.json", JSON.stringify(grades, null, 2));
        console.log("\nGrades fetched successfully:");
        //console.log(JSON.stringify(grades, null, 2));
    } catch (error) {
        console.error("\nAn error occurred:");
        console.error(error);
    } finally {
        rl.close();
    }
};

main();