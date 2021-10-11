import { emptyDir, exists } from "https://deno.land/std/fs/mod.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";
import type { Config } from '../src/lib.ts';
import { run } from '../src/lib.ts';

const serverPath = new URL("./server.ts", import.meta.url).href;

Deno.test("download sample file (from local)", async () => {
    const config: Config = {
        url: "http://localhost:8000/",
        dir: "test",
        innerHTML: "setup.exe"
    };
    // reset the testing environment
    await emptyDir(`./${config.dir}`);

    // create testing server in a different thread
    const worker = new Worker(serverPath, { type: "module", deno: true });

    // JANK: wait some time for server to start
    await new Promise((resolve) => setTimeout(resolve, 500));

    // run the program with our custom config
    await run(config);

    worker.terminate();

    // verify that the folder exists
    assert(exists('./test/test.html'));
});