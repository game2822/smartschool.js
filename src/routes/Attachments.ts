import { RestManager } from "../rest/RESTManager";
import { extractBaseUrl } from "skolengojs";

export const downloadAttachment = async(url: string, accessToken: string): Promise<Buffer> => {
    const [base, path] = extractBaseUrl(url);
    const manager = new RestManager(base);
    const response = await manager.get<Buffer>(path, {}, {
        Authorization: `Bearer ${accessToken}`
    });

    if (!response) {
        throw new Error("Failed to download attachment: Empty response.");
    }

    return response;
};
