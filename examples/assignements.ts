process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import readline from "readline";
import fs from "fs";
import { GetAssignments } from "../src/routes/Assignments";

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

        console.log("\nFetching assignments...");
        const assignments = await GetAssignments(url, userId, token, deviceId, periodStart, periodEnd);
        fs.writeFileSync("assignments.json", JSON.stringify(assignments, null, 2));

        console.log("\nAssignments fetched successfully:");
        console.log(JSON.stringify(assignments, null, 2));

        console.log("\ntrying to mark the first assignment as done...");
        if (assignments.length > 0) {
            const updatedAssignment = await assignments[0].setCompletion(true);
            console.log("Updated Assignment:", JSON.stringify(updatedAssignment, null, 2));
        } else {
            console.log("No assignments found to update.");
        }
    } catch (error) {
        console.error("\nAn error occurred:");
        console.error(error);
    } finally {
        rl.close();
    }
};

main();