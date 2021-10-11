import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { emptyDir } from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { download } from "./download.ts";

export interface Config {
  url: string,
  dir: string,
  innerHTML: string
}

export const run = async (config: Config) => {
  // Url from which to download krita nightly
  // Get the content of the page
  const html = await (await fetch(config.url)).text();

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
    if (links[i].textContent.toString().includes(config.innerHTML)) {
      fileURLLastHalf = (links[i] as Element).attributes.href;
      console.log("downloading from link: ", fileURLLastHalf);
    }
  }

  // If failed, leave
  if (!fileURLLastHalf) {
    console.log('selector selected invalid link');
    return;
  }

  const filename = fileURLLastHalf.substring(
    fileURLLastHalf.lastIndexOf("/") + 1,
  );

  // if file name is empty quit problem
  if (filename.length == 0) {
    console.log(`couldn't decide on filename based on selected url ${fileURLLastHalf}`);
    return;
  }

  console.log(`downloading '${fileURLLastHalf}' to '${filename}'`);

  // Empties downloads folder, creates emtpy folder if needed
  // Love javascript where the std just writes your entire program for you
  await emptyDir(`./${config.dir}`);

  // Try downloading it to downloads folder
  try {
    await download(
      config.url + fileURLLastHalf,
      { dir: path.join(".", config.dir, filename) },
    );
  } catch (err) {
    console.log(err);
  }
};

export const preview = async (dir: string) => {
  // Then open the window up
  const process = Deno.run({
    cmd: ["explorer", path.join(".", dir)],
  });
  await process.status();
}
