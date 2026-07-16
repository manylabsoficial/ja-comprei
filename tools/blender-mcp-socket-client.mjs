#!/usr/bin/env node
import fs from "node:fs";
import net from "node:net";
import { pathToFileURL } from "node:url";

const DEFAULT_HOST = process.env.BLENDER_MCP_HOST || "127.0.0.1";
const DEFAULT_PORT = Number(process.env.BLENDER_MCP_PORT || 9876);

function parseArgs(argv) {
  const args = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    code: "",
    file: "",
    timeoutMs: 15000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--host") args.host = argv[++i];
    else if (arg === "--port") args.port = Number(argv[++i]);
    else if (arg === "--code") args.code = argv[++i];
    else if (arg === "--file") args.file = argv[++i];
    else if (arg === "--timeout-ms") args.timeoutMs = Number(argv[++i]);
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node tools/blender-mcp-socket-client.mjs --code "import bpy; print(bpy.data.filepath)"
  node tools/blender-mcp-socket-client.mjs --file scripts/my_blender_script.py

Environment:
  BLENDER_MCP_HOST=127.0.0.1
  BLENDER_MCP_PORT=9876`);
      process.exit(0);
    }
  }

  if (args.file) args.code = fs.readFileSync(args.file, "utf8");
  if (!args.code) throw new Error("Provide --code or --file.");
  return args;
}

export function sendToBlender({ code, host = DEFAULT_HOST, port = DEFAULT_PORT, timeoutMs = 15000 }) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ host, port, timeout: timeoutMs });
    const chunks = [];
    const request = Buffer.concat([
      Buffer.from(JSON.stringify({ type: "execute", code, strict_json: true }), "utf8"),
      Buffer.from([0]),
    ]);

    let settled = false;
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      client.destroy();
      fn(value);
    };

    client.on("connect", () => client.write(request));
    client.on("data", (chunk) => {
      chunks.push(chunk);
      if (chunk.includes(0)) {
        const raw = Buffer.concat(chunks).toString("utf8").replace(/\0+$/g, "");
        try {
          settle(resolve, JSON.parse(raw));
        } catch (error) {
          settle(reject, new Error(`Invalid Blender response: ${raw}\n${error.message}`));
        }
      }
    });
    client.on("timeout", () => settle(reject, new Error(`Timed out connecting to Blender MCP at ${host}:${port}.`)));
    client.on("error", (error) => settle(reject, error));
    client.on("close", () => {
      if (settled) return;
      const raw = Buffer.concat(chunks).toString("utf8").replace(/\0+$/g, "");
      if (!raw) settle(reject, new Error("Blender closed the connection without a response."));
      else {
        try {
          settle(resolve, JSON.parse(raw));
        } catch (error) {
          settle(reject, new Error(`Invalid Blender response: ${raw}\n${error.message}`));
        }
      }
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const response = await sendToBlender(args);
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
