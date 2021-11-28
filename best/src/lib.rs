use clap::{App, Arg};
use serde::{Deserialize, Serialize};
mod utils;

use wasm_bindgen::prelude::*;

// Log code from https://rustwasm.github.io/book/game-of-life/debugging.html
// Basically formats objects in rust and sends it as a string back to js to be logged
// this means no pretty syntax highlighting that you usually see in javascript console but
// regular rust doesn't have syntax highlighting for debug either, so it's fine
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn greet() -> String {
    "message from webassembly to make sure things are working".to_string()
}

// #[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Config {
    url: String,
    dir: String,
    inner_html: String,
    dry_run: bool,
}

// #[wasm_bindgen]
impl Config {
    //     // #[wasm_bindgen(constructor)]
    pub fn new(url: &str, dry_run: bool) -> Config {
        Config {
            url: url.to_string(),
            dir: "downloads".into(),
            inner_html: "setup.exe".into(),
            dry_run,
        }
    }
}

#[wasm_bindgen(catch)]
pub fn gen_config(args: &JsValue) -> Result<JsValue, JsValue> {
    utils::set_panic_hook();
    let args: Vec<String> = args.into_serde().unwrap();
    log!("{:#?}", args);

    let matches = match App::new("krita-download")
        .version("1.0")
        .author("Andy Li <SpicyRicecaker@gmail.com>")
        .about("Downloads krita")
        .args(&[
            // TODO adding .long() or .short() to any argument total bugs it out
            // (e.g. applying it to mode requires user to do --mode --mode 'plus|next')
            // Also, currently --mode needs to be set before --dry-run, for no apparent reason. I'm starting to hate cli apps more and more, because at some point once you start to pass more than 1 or 2 options to the app it becomes extremely unintuitive and buggy (think of ffmpeg or yt-dlp options)
            // I've spent 1 hour on little inconsistencies and it's really taxing
            // Maybe it's just because of the wasm environment, or maybe I didn't read the docs closely enough
            // TODO It's this config makes me do -- --dry-run instead of --dry-run, don't know why. another -4 minutes.
            // Kind of just want to do tauri apps instead ngl
            Arg::new("mode")
                .about("what version of krita to download")
                // .takes_value(true)
                .possible_values(["plus", "next"])
                // TODO currently, because we require a value for krita version, user cannot pass in -h option without an error lol
                // clap should have a way to deal with this but I don't know the right settings, so going to ignore for now
                .required(true),
            Arg::new("dry-run")
                .about("only check version, do not download")
                // .takes_value(false),
        ])
        .try_get_matches_from(args)
    {
        Ok(m) => m,
        Err(e) => return Err(format!("Unrecognized option. {}", e).into()),
    };

    let url = match matches.value_of("mode").unwrap() {
        "plus" => "https://binary-factory.kde.org/job/Krita_Stable_Windows_Build/",
        "next" => "https://binary-factory.kde.org/job/Krita_Nightly_Windows_Build/",
        _ => unreachable!(),
    };

    let dry_run = matches.is_present("dry-run");

    let config = Config::new(url, dry_run);
    Ok(JsValue::from_serde(&config).unwrap())
}
