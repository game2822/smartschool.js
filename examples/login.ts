import { input } from '@inquirer/prompts';
import search from '@inquirer/search';
import { ChallengeMethod } from '../src/util/Constants';
import { getSmartschoolLoginUrl, GetOIDCAccessTokens } from '../src/routes/OIDC';
import { crypto } from '@noble/hashes/crypto';
import {generateRandomCode} from '../src/util/Verifier';

const TOKEN_ENDPOINT_PATH = "/OAuth/mobile/token";
    function base64UrlEncode(buffer: ArrayBuffer): string {
    return Buffer.from(buffer)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
(async () => {
    const baseURL = await input({ message: 'Enter your instance URL of your Smartschool (e.g., https://myschool.smartschool.be)' });
    console.log(`[DEBUG] Base URL: ${baseURL}`);
    const selectedMethod = await search({
        message: 'Select your challenge generation method',
        source: async () => {
            return Object.values(ChallengeMethod).map((method) => ({
                name: method === ChallengeMethod.S256 ? String(method) + " (recommended)" : String(method),
                value: method
            }));
        },
    });

    console.log(`[DEBUG] Selected challenge method: ${selectedMethod}`);
    const codeVerifier = generateRandomCode();
    console.log(`[DEBUG] Generated code verifier: ${codeVerifier}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
    const codeChallenge = base64UrlEncode(hashBuffer);

    console.log(`[DEBUG] Selected challenge method: ${selectedMethod}`);
    console.log(`[DEBUG] Generated code challenge: ${codeChallenge}`);
    const loginUrl = getSmartschoolLoginUrl(baseURL, codeChallenge);
    console.log(`\x1b[32m➜\x1b[0m URL Generated to Log in: ${loginUrl}`);
    console.log(`\x1b[34m[INFO]\x1b[0m Save this code verifier for token exchange: ${codeVerifier}`);

    const code = await input({ message: 'Paste the code you received after login:' });
    console.log(`[DEBUG] Received code: ${code}`);
    try {
        const tokenEndpoint = baseURL + TOKEN_ENDPOINT_PATH;
        console.log(`[DEBUG] Token endpoint: ${tokenEndpoint}`);
        console.log(`[DEBUG] Exchanging code for tokens with:`);
        console.log(`        code: ${code}`);
        console.log(`        code_verifier: ${codeVerifier}`);
        const tokens = await GetOIDCAccessTokens(tokenEndpoint, code, codeVerifier);
        console.log(`\x1b[32m✓\x1b[0m Login successful!`);
        console.log(tokens);
    } catch (error) {
        console.error(`\x1b[31m✗\x1b[0m Could not exchange code for tokens: ${error}`);
    }
})();