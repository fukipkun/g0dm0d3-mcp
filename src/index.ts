import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 3000);
const API_BASE = (process.env.G0DM0D3_API_BASE || "").replace(/\/+$/, "");
const API_KEY = process.env.GODMODE_API_KEY || "";
const MCP_TOKEN = process.env.MCP_AUTH_TOKEN || "";

function requireConfig() {
  if (!API_BASE) throw new Error("Missing G0DM0D3_API_BASE");
  if (!API_KEY) throw new Error("Missing GODMODE_API_KEY");
  if (!MCP_TOKEN) throw new Error("Missing MCP_AUTH_TOKEN");
}
function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = (req.header("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!MCP_TOKEN || token !== MCP_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
async function api(path: string, method = "GET", body?: unknown) {
  requireConfig();
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const text = await response.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(`G0DM0D3 API ${response.status}: ${JSON.stringify(data)}`);
  return data;
}
function createServer() {
  const server = new McpServer({ name: "g0dm0d3-mcp", version: "1.0.0" });

  server.tool("g0dm0d3_health", "Verifica a saúde da API G0DM0D3.", {}, async () => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/health"), null, 2) }]
  }));

  server.tool("g0dm0d3_info", "Obtém informações da API G0DM0D3.", {}, async () => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/info"), null, 2) }]
  }));

  server.tool("g0dm0d3_models", "Lista os modelos disponíveis na API G0DM0D3.", {}, async () => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/models"), null, 2) }]
  }));

  server.tool("g0dm0d3_chat", "Envia uma conversa para o endpoint compatível com OpenAI da G0DM0D3.", {
    messages: z.array(z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().positive().optional()
  }, async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/chat/completions", "POST", args), null, 2) }]
  }));

  server.tool("g0dm0d3_ultraplinian", "Executa uma solicitação pelo endpoint ULTRAPLINIAN.", {
    messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() })),
    model: z.string().optional(),
    tier: z.string().optional()
  }, async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/ultraplinian/completions", "POST", args), null, 2) }]
  }));

  server.tool("g0dm0d3_consortium", "Executa uma solicitação pelo endpoint CONSORTIUM.", {
    messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() })),
    model: z.string().optional(),
    tier: z.string().optional()
  }, async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/consortium/completions", "POST", args), null, 2) }]
  }));

  server.tool("g0dm0d3_autotune", "Analisa um prompt com AutoTune.", {
    prompt: z.string(),
    model: z.string().optional()
  }, async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/autotune/analyze", "POST", args), null, 2) }]
  }));

  server.tool("g0dm0d3_parseltongue_encode", "Codifica texto usando Parseltongue.", {
    text: z.string(),
    mode: z.string().optional()
  }, async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/parseltongue/encode", "POST", args), null, 2) }]
  }));

  server.tool("g0dm0d3_parseltongue_detect", "Detecta Parseltongue em um texto.", {
    text: z.string()
  }, async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/parseltongue/detect", "POST", args), null, 2) }]
  }));

  server.tool("g0dm0d3_stm_transform", "Transforma texto usando STM.", {
    text: z.string(),
    mode: z.string().optional()
  }, async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/v1/transform", "POST", args), null, 2) }]
  }));

  return server;
}

app.get("/health", (_req, res) => res.json({ status: "ok", service: "g0dm0d3-mcp" }));

app.post("/mcp", auth, async (req, res) => {
  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on("close", () => { void transport.close(); void server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error);
    if (!res.headersSent) res.status(500).json({ error: "MCP request failed" });
  }
});

app.get("/mcp", auth, (_req, res) => {
  res.status(405).json({ error: "Use POST for MCP Streamable HTTP requests." });
});
app.delete("/mcp", auth, (_req, res) => {
  res.status(405).json({ error: "Stateless MCP endpoint." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`G0DM0D3 MCP listening on 0.0.0.0:${PORT}`);
});
