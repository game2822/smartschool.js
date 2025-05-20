import { ChallengeMethod, SearchSchools } from '../src/';
import { input, Separator } from '@inquirer/prompts';
import search from '@inquirer/search';

(async () => {
    const schoolName = await input({ message: 'Enter the name of your school' });
    const schools = await SearchSchools(schoolName);
    const selectedSchool = await search({
        message: 'Select your school',
        source: async (input, { signal }) => {
            return schools.map((school) => ({
            name: school.name,
            value: school.id,
            description: `${school.location.city}, ${school.location.country}`,
            }));
        },
    });

    const selectedMethod = await search({
        message: 'Select your challenge generation method',
        source: async (input, { signal }) => {
            return Object.values(ChallengeMethod).map((method) => ({
            name: method === ChallengeMethod.S256 ? String(method)  + " (recommended)" : String(method),
            value: method
            }));
        },
    });

    const flow = await schools.find((school) => school.id === selectedSchool)?.initializeLogin(selectedMethod);
    console.log(`\x1b[32m➜\x1b[0m URL Generated to Log in: ${flow?.loginURL}`);
    const state = await input({ message: 'Enter the state to verify the request' });
    const code = await input({ message: 'Enter the code to complete authentication' });
    try {
        const client = await flow?.finalizeLogin(code, state);
        console.log(`\x1b[32m✓\x1b[0m Login successful!`);
        console.log(client);
    } catch (error) {
        console.error(`\x1b[31m✗\x1b[0m We could not finalize the login: ${error}`);
    }
})();