process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import readline from "readline";
import fs from "fs";
import { getTimetableForPeriods } from "../src/routes/Agenda";
import { GetGradesSettings, GetGradesForPeriod, GetSubjects } from "../src/routes/Grades";

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
        const allSubjects = await GetSubjects(url, deviceId, token);
        const subjectsMap = new Map<string, typeof allSubjects[0]>();
        allSubjects.forEach(subject => subjectsMap.set(subject.id, subject));

        console.log(`Found ${subjectsMap.size} subjects.`);
        console.log("Subjects:", Array.from(subjectsMap.values()).map(s => s.name).join(", "));
        fs.writeFileSync("subjects.json", JSON.stringify(Array.from(subjectsMap.values()), null, 2));


        // Fetch grades for the selected period
        console.log(`\nFetching grades for period: ${selectedPeriod.label || selectedPeriod.startDate || selectedPeriod.endDate || selectedPeriod.id}...`);
        const grades = await GetGradesForPeriod(url, deviceId, token, selectedPeriod.id);

        fs.writeFileSync("grades.json", JSON.stringify(grades, null, 2));
        console.log("\nGrades fetched successfully:");
        console.log(JSON.stringify(grades, null, 2));
    } catch (error) {
        console.error("\nAn error occurred:");
        console.error(error);
    } finally {
        rl.close();
    }
};

main();