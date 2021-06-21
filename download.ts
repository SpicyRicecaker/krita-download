import { readerFromStreamReader } from "https://deno.land/std/io/mod.ts";

export const download = async (
  url: string,
  options: { dir: string },
): Promise<void> => {
    // Download the url
    const res = await fetch(url);
    // Create reader (which has a complex api)
    const wrdr = res?.body?.getReader();

    // If failed, return
    if (!wrdr) {
      return;
    }
    // Use deno wrapper of reader
    const reader = readerFromStreamReader(wrdr);

    // create: true will create directory
    // IF U DO `create: true` AND HAVE `ensureDirectory(...)`, there will be a permission error!
    // Create new file
    const newFile = await Deno.open(options.dir, { create: true, write: true });

    // Copy content over
    await Deno.copy(reader, newFile);

    // Close file
    Deno.close(newFile.rid);
};
