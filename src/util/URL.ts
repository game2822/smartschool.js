export const extractBaseUrl = (url: string): [string, string] => {
    const parts = url.split("/");
    const baseUrl = parts.slice(0, 3).join("/");
    const path = parts.slice(3).join("/");
    return [baseUrl, path];
};