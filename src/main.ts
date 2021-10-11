import { Config, run, preview } from "./lib.ts";

(async () => {
    const config: Config = {
        url: "https://binary-factory.kde.org/job/Krita_Nightly_Windows_Build/",
        dir: "downloads",
        innerHTML: "setup.exe"
    };
    console.log('set config');
    // download the file via webscraping
    await run(config);
    // preview the file in windows explorer
    await preview(config.dir);
})();