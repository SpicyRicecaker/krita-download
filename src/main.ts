import { Config, run } from "./lib.ts";

(async () => {
  const config: Config = {
    url: "https://binary-factory.kde.org/job/Krita_Nightly_Windows_Build/",
    dir: "downloads",
    innerHTML: "setup.exe"
  };
  console.log('set config');
  await run(config);
})();