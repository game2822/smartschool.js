import { input } from '@inquirer/prompts';
import search from '@inquirer/search';
import { ChallengeMethod } from '../src/util/Constants';
import { getSmartschoolLoginUrl, GetOIDCAccessTokens, OIDCRefresh, isValidInstance, finalizeLogin } from '../src/routes/OIDC';
import { crypto } from '@noble/hashes/crypto';
import {generateRandomCode} from '../src/util/Verifier';
import { url } from 'inspector';
import { LoginWithToken } from '../src';

const TOKEN_ENDPOINT_PATH = "/OAuth/mobile/token";
    function base64UrlEncode(buffer: ArrayBuffer): string {
    return Buffer.from(buffer)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
let auth: { access_token: string; refresh_token: string; } = { access_token: '', refresh_token: '', expires_in: 0, token_type: ''};
(async () => {
    const baseURL = await input({ message: 'Enter your instance URL of your Smartschool (e.g., https://myschool.smartschool.be)' });
    console.log(`[DEBUG] Base URL: ${baseURL}`);
    console.log(await isValidInstance(baseURL) ? "\x1b[32m✓\x1b[0m Instance is valid." : "\x1b[31m✗\x1b[0m Instance is not valid.");
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
    const loginUrl = await getSmartschoolLoginUrl(baseURL);
    console.log(`\x1b[32m➜\x1b[0m URL Generated to Log in: ${loginUrl}`);
    console.log(`\x1b[34m[INFO]\x1b[0m Save this code verifier for token exchange: ${codeVerifier}`);

    const code = await input({ message: 'Paste the code you received after login:' });
    console.log(`[DEBUG] Received code: ${code}`);
    let tokens: any = null;
    let tokenEndpoint = baseURL + TOKEN_ENDPOINT_PATH;
    try {
        console.log(`[DEBUG] Token endpoint: ${baseURL}`);
        console.log(`[DEBUG] Exchanging code for tokens with:`);
        console.log(`        code: ${code}`);
        console.log(`        code_verifier: ${codeVerifier}`);
        const loginResult = await finalizeLogin(baseURL, code, "android", "test", crypto.randomUUID());
        console.log("loginresult: ", loginResult);
        auth = {
            access_token: loginResult.accessToken,
            refresh_token: loginResult.refreshToken,
        };
        console.log(`\x1b[32m✓\x1b[0m Login successful!`);
        console.log(auth);
    } catch (error) {
        console.error(`\x1b[31m✗\x1b[0m Could not exchange code for tokens: ${error}`);
    }
    const refresh = await input({ message: 'Do you want to refresh the access token? (yes/no)' });
    if (refresh.toLowerCase() === 'yes') {
        try {
            console.log(`[DEBUG] Token endpoint: ${baseURL}`);
            console.log(`[DEBUG] Refreshing access token with refresh token: ${auth.refresh_token}`);
            const newTokens = await LoginWithToken(baseURL + "/OAuth/mobile/token", auth.refresh_token, "android", "testpapillon", crypto.randomUUID());
            console.log(`\x1b[32m✓\x1b[0m Token refresh successful!`);
            console.log(newTokens);
        } catch (error) {
            console.error(`\x1b[31m✗\x1b[0m Could not refresh access token: ${error}`);
        }
    }
})();