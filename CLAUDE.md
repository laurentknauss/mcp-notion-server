# Notion MCP Server - Session Notes (2025-10-18)

## Session Summary

Refactoring Notion MCP server from stdio transport to HTTP-based transport for deployment on Alpic.ai cloud platform.

## Work Completed

### HTTP Transport Refactoring

**Goal:** Convert from stdio transport (CLI-based) to HTTP/SSE transport for Alpic.ai deployment, following the official Alpic.ai template pattern.

### Files Created

1. **`src/index-http.ts`** ✅
   - Express server with Streamable HTTP transport
   - Handles POST /mcp endpoint for MCP protocol
   - Port configuration from environment (default: 3000)
   - Proper error handling and graceful shutdown

2. **`src/config.ts`** ✅
   - Centralized environment configuration
   - `MCP_HTTP_PORT`: Server port (default 3000)
   - `NOTION_API_TOKEN`: Required Notion API token

3. **`src/server/http-server.ts`** ✅
   - McpServer implementation using new SDK API
   - Trimmed from 18 tools to 9 essential tools
   - All tools use new `.tool()` method pattern
   - Zod schema validation for all parameters

### 9 Essential Notion Tools Selected

The original server had 18 tools. For efficiency and to match actual usage patterns, we trimmed to these 9:

1. **`notion_search`** - Search pages/databases by title
2. **`notion_retrieve_page`** - Get page content and properties
3. **`notion_retrieve_block_children`** - Read block content (essential for reading page content)
4. **`notion_query_database`** - Query database with filters/sorts
5. **`notion_retrieve_database`** - Get database schema and info
6. **`notion_append_block_children`** - Add content to pages (essential for writing)
7. **`notion_create_database_item`** - Create new database entries
8. **`notion_update_page_properties`** - Update page/database item properties
9. **`notion_delete_block`** - Delete blocks

### Dependencies Updated

**package.json changes:**

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",  // Updated from 1.7.0
    "express": "^5.1.0",                      // NEW
    "zod": "^3.25.51",                        // NEW
    "yargs": "^17.7.2",
    "vitest": "3.0.9"
  },
  "devDependencies": {
    "@types/express": "^5.0.3",               // NEW
    "@types/node": "^20.11.24",
    "@types/yargs": "^17.0.33",
    "tsx": "^4.19.4",                         // NEW
    "typescript": "^5.3.3"
  }
}
```

**New scripts:**
- `build:http` - Build HTTP server version
- `start:http` - Start HTTP server
- `dev:http` - Development mode with hot reload

## Technical Details

### Architecture Pattern

Following Alpic.ai template at `/home/laurent/mcp-servers/mcp-server-template-nodejs/`:

```text
src/
  ├── index-http.ts       # Express server + HTTP transport
  ├── config.ts           # Environment config
  ├── server/
  │   └── http-server.ts  # McpServer with tools
  └── client/             # (existing Notion API wrapper)
```
### MCP SDK Upgrade

**Old pattern (stdio):**
```typescript
const server = new Server(...)
server.setRequestHandler(ListToolsRequestSchema, async () => { ... })
```

**New pattern (HTTP):**
```typescript
const server = new McpServer(...)
server.tool("tool_name", "description", { schema }, async (params) => { ... })
```

### Key Features

1. **Streamable HTTP Transport** - SSE-based protocol for real-time updates
2. **Zod Validation** - Type-safe parameter validation
3. **Express Server** - Production-ready HTTP server
4. **Environment Config** - Port and API token from env vars
5. **Error Handling** - Proper JSON-RPC error responses

## Current Status

### Completed ✅
- Created HTTP server infrastructure
- Implemented 9 essential Notion tools
- Updated package.json with dependencies
- Created configuration system

### TODO (Next Session)
- [ ] Run `npm install` to install new dependencies
- [ ] Build HTTP server: `npm run build:http`
- [ ] Test locally: `npm run dev:http`
- [ ] Verify Notion API calls work
- [ ] Update/create README.md documenting Alpic.ai refactor
- [ ] Commit changes to git
- [ ] Deploy to Alpic.ai
- [ ] Test deployed version

## Environment Variables

**Required:**
- `NOTION_API_TOKEN`: Your Notion integration token
  - Get your token from https://www.notion.so/my-integrations

**Optional:**
- `MCP_HTTP_PORT` or `PORT`: Server port (default: 3000)

## Alpic.ai Deployment

**Expected URL pattern:**
```text
https://mcp-notion-server-[hash].alpic.live/mcp
```
**GitHub Repository:**
To be pushed for Alpic.ai auto-deployment

## Context from Previous Work

This refactoring was part of testing Alpic.ai as a cloud MCP hosting platform:

1. **Reddit MCP Server** - Discovered Reddit blocks datacenter IPs (Alpic.ai, Cloudflare Workers)
   - Works locally perfectly
   - Gets "Blocked" on cloud platforms
   - This is IP-based blocking, not a code issue

2. **Notion MCP Server** - Should work on Alpic.ai since Notion API doesn't block datacenter IPs
   - This refactor will verify Alpic.ai works for proper API services
   - Unlike Reddit's public scraping endpoints, Notion uses authenticated API

## File Locations

- **Project root:** `/home/laurent/mcp-servers/mcp-notion-server/`
- **New HTTP files:**
  - `src/index-http.ts`
  - `src/config.ts`
  - `src/server/http-server.ts`
- **Original stdio version:** `src/index.ts` (kept for backward compatibility)
- **Alpic.ai template:** `/home/laurent/mcp-servers/mcp-server-template-nodejs/`

## Git Status

**Current branch:** main
**Last commit:** April 11, 2025 (original stdio version)
**Untracked files:**
- src/config.ts
- src/index-http.ts
- src/server/http-server.ts

**Modified files:**
- package.json (dependencies and scripts updated)

## Next Session Quick Start

```bash
cd /home/laurent/mcp-servers/mcp-notion-server

# Install new dependencies
npm install

# Build HTTP version
npm run build:http

# Test locally
npm run dev:http

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# If working, commit and push
git add .
git commit -m "Refactor to HTTP transport for Alpic.ai deployment"
git push origin main
```

## Notes

- Original server had 18 tools, trimmed to 9 most essential ones
- Kept stdio version intact at `src/index.ts` for backward compatibility
- HTTP version uses port 3000 by default (configurable via env vars)
- Follows Alpic.ai template conventions exactly
- All tools support both JSON and Markdown output formats
