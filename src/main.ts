import { Config, run, preview } from "./lib.ts";

(async () => {
    if (Deno.args.length != 1) {
        console.log('usage: deno run [plus|next]');
        return;
    }

    let url = '';
    switch (Deno.args[0]) {
        case ('plus'):
            url = 'https://binary-factory.kde.org/job/Krita_Stable_Windows_Build/'
            break;
        case ('next'):
            url = 'https://binary-factory.kde.org/job/Krita_Nightly_Windows_Build/'
            break;
        default:
            console.log('usage: deno run [plus|next]')
            return
    }

    const config: Config = {
        url: url,
        dir: "downloads",
        innerHTML: "setup.exe"
    };
    console.log('set config');
    // download the file via webscraping
    await run(config);
    // preview the file in windows explorer
    await preview(config.dir);
})();