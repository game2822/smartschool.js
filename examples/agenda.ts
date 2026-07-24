process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
import readline from "readline";
import fs from "fs";
import { getTimetableForPeriods } from "../src/routes/Agenda";
import { LoginWithToken } from "../src";
import dotenv from "dotenv";
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
        const url = process.env.INSTANCE_URL || await askQuestion("Enter the instance URL (e.g., https://example.com): ");
        const refreshToken = process.env.REFRESH_TOKEN || await askQuestion("Enter your refresh token: ");
      const userId = process.env.USER_ID || await askQuestion("Enter your user ID: ");
      const SMSCMobileID = process.env.SMSCMobileID || await askQuestion("Enter your SMSCMobileID: ")

        const periodStart = new Date("2026-02-09");
        const periodEnd = new Date("2026-02-15");
        const data = await LoginWithToken(url, refreshToken, SMSCMobileID);
        const token = data.accessToken;
        console.log("\nFetching timetable...");
        const timetable = await getTimetableForPeriods(url, userId, token, SMSCMobileID, periodStart, periodEnd);
        fs.writeFileSync("timetable.json", JSON.stringify(timetable, null, 2));
        const tomorrow = new Date("2026-02-11");
        const tomorrowDateString = tomorrow.toISOString().split("T")[0];

       const lessonsForTomorrow = timetable
        .filter(day => new Date(day.date).toISOString().split("T")[0] === tomorrowDateString)
        .flatMap(day => day.lessons || []);


        console.log("\nTimetable fetched successfully:");
        console.log(JSON.stringify(timetable, null, 2));
        console.log("you have " + lessonsForTomorrow.length + " entries in your timetable for the next day");
        console.log("Details:", JSON.stringify(lessonsForTomorrow, null, 2));

    } catch (error) {
        console.error("\nAn error occurred:");
        console.error(error);
    } finally {
        rl.close();
    }
};

main();
