#!/usr/bin/env node
import { sendToBlender } from "./blender-mcp-socket-client.mjs";

const serverInfo = {
  name: "ja-comprei-blender-mcp",
  version: "0.1.0",
};

const tools = [
  {
    name: "blender_execute",
    description: "Execute Python code inside the active Blender file through the Blender MCP socket bridge.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Python code to execute in Blender." },
        timeoutMs: { type: "number", description: "Optional timeout in milliseconds." },
      },
      required: ["code"],
      additionalProperties: false,
    },
  },
  {
    name: "blender_scene_info",
    description: "Return high-level information about the active Blender scene and the Ja Comprei first-scene collection.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function result(id, value) {
  writeMessage({ jsonrpc: "2.0", id, result: value });
}

function errorResult(id, code, message) {
  writeMessage({ jsonrpc: "2.0", id, error: { code, message } });
}

function textContent(value) {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

async function callTool(name, args = {}) {
  if (name === "blender_execute") {
    const response = await sendToBlender({
      code: args.code,
      timeoutMs: args.timeoutMs || 15000,
    });
    return textContent(response);
  }

  if (name === "blender_scene_info") {
    const code = `
import bpy, json
col = bpy.data.collections.get("SCENE_01_CHEGADA_MERCADO_SCROLLABLE")
scene = bpy.context.scene
payload = {
    "filepath": bpy.data.filepath,
    "frame_start": scene.frame_start,
    "frame_end": scene.frame_end,
    "fps": scene.render.fps,
    "resolution": [scene.render.resolution_x, scene.render.resolution_y],
    "render_engine": scene.render.engine,
    "camera": scene.camera.name if scene.camera else None,
    "scene_01_collection_exists": bool(col),
    "scene_01_object_count": len(col.objects) if col else 0,
    "scene_01_key_objects_present": all(bpy.data.objects.get(name) for name in [
        "S01_foreground_thermal_receipt_curled_no_readable_text",
        "S01_midground_open_kraft_grocery_bag_primary_front_panel",
        "S01_Camera_scroll_scene_01_macro_hero",
        "S01_Key_Area_Warm_Window_Light"
    ]),
}
print(json.dumps(payload, ensure_ascii=False))
`;
    const response = await sendToBlender({ code, timeoutMs: 15000 });
    return textContent(response);
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function handleMessage(message) {
  if (!message || message.jsonrpc !== "2.0") return;
  if (message.method?.startsWith("notifications/")) return;

  try {
    if (message.method === "initialize") {
      result(message.id, {
        protocolVersion: message.params?.protocolVersion || "2024-11-05",
        capabilities: { tools: {} },
        serverInfo,
      });
      return;
    }

    if (message.method === "tools/list") {
      result(message.id, { tools });
      return;
    }

    if (message.method === "tools/call") {
      const toolResult = await callTool(message.params?.name, message.params?.arguments || {});
      result(message.id, toolResult);
      return;
    }

    errorResult(message.id, -32601, `Method not found: ${message.method}`);
  } catch (error) {
    errorResult(message.id, -32000, error.message);
  }
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() || "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      void handleMessage(JSON.parse(trimmed));
    } catch (error) {
      errorResult(null, -32700, `Parse error: ${error.message}`);
    }
  }
});

process.stdin.on("end", () => process.exit(0));
