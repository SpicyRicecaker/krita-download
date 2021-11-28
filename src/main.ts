import { dirname, fromFileUrl, resolve } from "https://deno.land/std/path/mod.ts";
import { Config, run, preview } from "./lib.ts";

import init, { greet, gen_config } from "../best/pkg/best.js";

await init(Deno.readFile(resolve(dirname(fromFileUrl(import.meta.url)), "..", 'best', 'pkg', 'best_bg.wasm')));

(async () => {
    const string = greet();
    console.log(string);

    console.log('ok sending deno args over', Deno.args);
    try {
        const config: Config = gen_config(Deno.args);
        console.log('running with config', config);

        console.log('is this a dry run', config.dry_run);
        await run(config);
        // preview the file in windows explorer, if we're not just checking the version
        if (!config.dry_run) {
            await preview(config.dir);
        }
    } catch (e) {
        console.log(e);
    }

})();