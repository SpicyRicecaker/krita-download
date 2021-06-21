import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { emptyDir } from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { download } from "./download.ts";

(async () => {
  // Url from which to download krita nightly
  const url = "https://binary-factory.kde.org/job/Krita_Nightly_Windows_Build/";

  // Get the content of the page
  const html = await (await fetch(url)).text();

  // Generate virtual dom from html
  const doc = new DOMParser().parseFromString(html, "text/html");

  // If failed, leave
  if (!doc) {
    return;
  }

  // Get all links from page
  const links = doc.querySelectorAll("a");

  // Try to get the `windows...setup.exe` file
  let fileURLLastHalf;
  for (let i = 0; i < links.length; i++) {
    if (links[i].textContent.toString().includes("setup.exe")) {
      console.log("downloading: ", (links[i] as Element).attributes.href);
      fileURLLastHalf = (links[i] as Element).attributes.href;
    }
  }

  // If failed, leave
  if (!fileURLLastHalf) {
    return;
  }

  const filename = fileURLLastHalf.substring(
    fileURLLastHalf.lastIndexOf("/") + 1,
  );

  // Empties downloads folder, creates emtpy folder if needed
  // Love javascript where the std just writes your entire program for you
  await emptyDir("./downloads");

  // Try downloading it to downloads folder
  try {
    await download(
      url + fileURLLastHalf,
      { dir: path.join(".", "downloads", filename) },
    );
    // Then open the window up
    const process = Deno.run({
      cmd: ["explorer", path.join(".", "downloads")],
    });
    await process.status();
  } catch (err) {
    console.log(err);
  }
})();
