process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import readline from "readline";
import fs from "fs";
import dotenv from "dotenv";
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
        const deviceId = process.env.DEVICE_ID ?? "";

        // Refresh token and get device ID
        console.log("Refreshing token...");
        const smartschool = await LoginWithToken(url, refreshToken, deviceId);
        console.log("Token refreshed successfully.");

        // Fetch attendance items
        console.log("\nFetching attendance items...");
        const attendanceItems = await smartschool.GetAttendanceItems();

        fs.writeFileSync("attendance.json", JSON.stringify(attendanceItems, null, 2));
        console.log("\nAttendance items fetched successfully:");
        console.log(`Found ${attendanceItems.length} attendance items.`);
        console.log(JSON.stringify(attendanceItems, null, 2));
    } catch (error) {
        console.error("\nAn error occurred:");
        console.error(error);
    } finally {
        rl.close();
    }
};

main();