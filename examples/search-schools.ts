import { SearchSchools } from '../src/';

(async () => {
    const schools = await SearchSchools("Paris");
    const OIDC = await schools[0].initializeLogin();
    console.log(OIDC);
})();