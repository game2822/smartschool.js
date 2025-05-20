export const DecodePayload = (token: string): Record<string, unknown> => {
    const payload = token.split(".")[1];
    const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decodedPayload);
}