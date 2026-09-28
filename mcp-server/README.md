# 🤖 ToolScout MCP Server (Model Context Protocol)

This private MCP server enables AI agents (like Claude Desktop, Cursor, Antigravity, Windsurf, or custom LLM scripts) to autonomously manage, scrape, categorize, and add new AI tools/websites directly to your ToolScout catalog.

---

## 🛠️ Available MCP Tools

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `add_website` | `url` (required), `name`, `category`, `description`, `price`, `tags`, `icon`, `featured` | Adds a new AI website to the directory. Auto-scrapes metadata if omitted. |
| `batch_add_websites` | `urls` (array of string URLs) | Batch scrapes and adds a list of website URLs in one call. |
| `list_websites` | `category`, `query`, `limit` | Searches and lists active tools in the catalog. |
| `delete_website` | `id` or `name` | Deletes a tool from the catalog. |
| `get_catalog_stats` | *(none)* | Returns total tool count and breakdown by category. |

---

## ⚡ Connecting to AI Agents

### 1. Claude Desktop
Add this to your Claude Desktop configuration file (`%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "toolscout": {
      "command": "node",
      "args": [
        "c:/Users/HP/Downloads/Toolscout files/toolscout-main/mcp-server/index.js"
      ]
    }
  }
}
```

### 2. Cursor AI / Windsurf
Add to `.cursor/mcp.json` in your workspace:

```json
{
  "mcpServers": {
    "toolscout": {
      "command": "node",
      "args": ["mcp-server/index.js"]
    }
  }
}
```

---

## 💻 Standalone CLI Command (No AI Required)

You can also add any website directly from your terminal using the built-in CLI:

```bash
npm run add:tool https://gamma.app "Gamma" presentation
```
Or simply:
```bash
npm run add:tool https://gamma.app
```
*(Automatically extracts domain name, generates smart tags, assigns categories, and writes directly into your codebase).*
