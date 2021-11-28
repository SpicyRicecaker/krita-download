// deno-lint-ignore-file camelcase
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
  inner_html: string
  dry_run: boolean
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
  let fileURL;
  for (let i = 0; i < links.length; i++) {
    // If the text includes `...setup.exe`
    if (links[i].textContent.toString().includes(config.inner_html)) {
      // Get the file url from the href of the text
      fileURL = (links[i] as Element).attributes.href;
      console.log("found file link: ", fileURL);
    }
  }

  // If failed, leave
  if (!fileURL) {
    console.log('selector selected invalid link');
    return;
  }

  // If we found the link, try to parse the name of the file from the link (e.g. `krita-ver-68.exe`)
  const filename = fileURL.substring(
    fileURL.lastIndexOf("/") + 1,
  );

  // if file name is empty quit problem
  if (filename.length == 0) {
    console.log(`couldn't decide on filename based on selected url ${fileURL}`);
    return;
  }

  if (config.dry_run) {
    console.log(`version is ${filename}`)
  } else {
    console.log(`downloading '${fileURL}' to '${filename}'`);
    await download_file(config, fileURL, filename);
  }
};

const download_file = async (config: Config, fileURL: string, filename: string) => {

  // Empties downloads folder, creates emtpy folder if needed
  // Love javascript where the std just writes your entire program for you
  await emptyDir(`./${config.dir}`);

  // Try downloading it to downloads folder
  try {
    await download(
      config.url + fileURL,
      { dir: path.join(".", config.dir, filename) },
    );
  } catch (err) {
    console.log(err);
  }
}

export const preview = async (dir: string) => {
  // Then open the window up
  const process = Deno.run({
    cmd: ["explorer", path.join(".", dir)],
  });
  await process.status();
}
