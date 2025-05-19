import { SearchSchools } from '../src/';

(async () => {
    const schools = await SearchSchools("Paris");
    console.log(schools);
})();