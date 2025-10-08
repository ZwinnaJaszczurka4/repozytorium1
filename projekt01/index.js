import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { URL } from "node:url"

const port = 8000;
const host = "localhost";

const index_html = readFileSync("index.html");
const moj_favicon = readFileSync("favicon.ico");

// Create a HTTP server
const server = createServer((req, res) => {
  const request_url = new URL(`http://${host}${req.url}`);
  const path = request_url.pathname;
  console.log(`Request: ${req.method} ${path}`);

  if (path === "/") {
    if (req.method !== "GET") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method not allowed\n");
      console.log("cos sie nie zrobilo");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(index_html);
      console.log("chyba zadzialalo");
    }
  }

  if (path === "/favicon.ico") {
    if (req.method !== "GET") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method not allowed\n");
      console.log("cos sie nie zrobilo");
    } else {
      res.writeHead(200, { "Content-Type": "image/vnd.microsoft.icon" });
      res.end(moj_favicon);
      console.log("chyba zadzialalo");
    }
  }

  if (!res.writableEnded) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Site not found!\n");
  }
});


server.listen(port);
console.log(`Server listening on port http://localhost:${port}`);
