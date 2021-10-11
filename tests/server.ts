// create temporary server
const server = Deno.listen({ port: 8000 });

console.log('starting server on port 8000')
for await (const request of server) {
    const httpConn = Deno.serveHttp(request);
    for await (const conn of httpConn) {
        // console.log(conn.request);
        await conn.respondWith(
            new Response(await Deno.readTextFile("./test.html"), {
                headers: {
                    "content-type": "text/html"
                },
                status: 200,
            }),
        )
    }
}