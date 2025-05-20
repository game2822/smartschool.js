import { ChallengeMethod, SearchSchools } from '../src/';
import { input, Separator } from '@inquirer/prompts';
import search from '@inquirer/search';

(async () => {
    const schoolName = await input({ message: 'Enter the name of your school' });
    const schools = await SearchSchools(schoolName);
    console.log(`\x1b[32m➜\x1b[0m Found ${schools.length} schools matching "${schoolName}"`);
    for (const school of schools) {
        console.log(`\x1b[32m➜\x1b[0m ${school.name} (${school.location.city}, ${school.location.country})`);
    }
})();