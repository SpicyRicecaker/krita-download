# Krita Download

Downloads the latest krita nightly or beta installer for windows and opens it up in an explorer window

## To run

1 Install deno

```shell
scoop install deno
```

2 run the program by running `next.bat` or `plus.bat` (via commandline or double-clicking) 

```shell
.\plus.bat # or next.bat
```

OR

manually call `deno run` and pass the corresponding permissions in
```shell
deno run --allow-env --allow-net --allow-write --allow-run --allow-read --unstable src/main.ts plus
```
