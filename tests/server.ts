import { dirname, fromFileUrl, resolve } from "https://deno.land/std/path/mod.ts";

// create temporary server
const server = Deno.listen({ port: 8000 });

console.log('starting server on port 8000')
for await (const request of server) {
    const httpConn = Deno.serveHttp(request);
    for await (const conn of httpConn) {
        // console.log(conn.request);
        console.log(resolve(dirname(fromFileUrl(import.meta.url)), "test.html"));
        await conn.respondWith(
            new Response(await Deno.readTextFile(resolve(dirname(fromFileUrl(import.meta.url)), "test.html")), {
                headers: {
                    "content-type": "text/html"
                },
                status: 200,
            }),
        )
    }
}