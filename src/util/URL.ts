export const extractBaseUrl = (url: string): [string, string] => {
    const parts = url.split("/");
    const baseUrl = parts.slice(0, 3).join("/");
    const path = parts.slice(3).join("/");
    console.log(`[DEBUG] extractBaseUrl input: ${url}`);
    console.log(`[DEBUG] parts:`, parts);
    console.log(`[DEBUG] baseUrl: ${baseUrl}`);
    console.log(`[DEBUG] path: ${path}`);
    return [baseUrl, path];
};