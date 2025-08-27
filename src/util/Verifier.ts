import { createHash } from "crypto";

export function generateRandomCode(length = 43): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}

/**
 * Generates a PKCE code challenge from a code verifier.
 * @param verifier The code verifier string.
 * @param method The challenge method: "S256" or "plain".
 */
export function generateCodeChallenge(verifier: string, method: "S256" | "plain" = "S256"): string {
    if (method === "plain") return verifier;
    // S256: SHA256 hash, then base64url encode
    const hash = createHash("sha256").update(verifier).digest("base64");
    return hash
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}