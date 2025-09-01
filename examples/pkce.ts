import crypto from 'crypto';

function generateCodeVerifier(): string {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    return codeVerifier;
}

function generateCodeChallenge(codeVerifier: string): string {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return hash;
}

function generatePKCEPair() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    return { codeVerifier, codeChallenge };
}

const pkcePair = generatePKCEPair();
console.log('Code Verifier:', pkcePair.codeVerifier);
console.log('Code Challenge:', pkcePair.codeChallenge);