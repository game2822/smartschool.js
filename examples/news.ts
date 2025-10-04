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

        // Fetch news
        console.log("\nFetching news...");
        const news = await smartschool.GetNews();

        fs.writeFileSync("news.json", JSON.stringify(news, null, 2));
        console.log("\nNews fetched successfully:");
        console.log(`Found ${news.length} news items.`);
        console.log(JSON.stringify(news, null, 2));
    } catch (error) {
        console.error("\nAn error occurred:");
        console.error(error);
    } finally {
        rl.close();
    }
};

main();