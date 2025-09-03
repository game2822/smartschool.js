process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
import readline from "readline";
import fs from "fs";
import { getTimetableForPeriods } from "../src/routes/Agenda";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

const main = async () => {
    try {
        const url = await askQuestion("Enter the base URL (e.g., https://example.smartschool.be): ");
        const token = await askQuestion("Enter your access token: ");
        const userId = await askQuestion("Enter the user ID: ");
        const deviceId = await askQuestion("Enter the device ID: ");

        const periodStart = new Date(); // Default to today
        const periodEnd = new Date(new Date().setDate(periodStart.getDate() + 7)); // Default to 7 days from today

        console.log("\nFetching timetable...");
        const timetable = await getTimetableForPeriods(url, userId, token, deviceId, periodStart, periodEnd);
        fs.writeFileSync("timetable.json", JSON.stringify(timetable, null, 2));

        console.log("\nTimetable fetched successfully:");
        console.log(JSON.stringify(timetable, null, 2));
    } catch (error) {
        console.error("\nAn error occurred:");
        console.error(error);
    } finally {
        rl.close();
    }
};

main();