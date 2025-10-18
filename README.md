# MCP Server Notion

A Model Context Protocol (MCP) server that provides access to Notion's API through streamable HTTP transport, enabling remote deployment on cloud platforms.

**Built with the [Alpic.ai Node.js MCP Template](https://github.com/alpic-ai/mcp-server-template-nodejs)** for streamable HTTP transport and cloud deployment.

## Remote Deployment

### Deploy on Alpic.ai

This MCP server is designed for remote deployment on **[Alpic.ai](https://alpic.ai)**, a French-based MCP cloud service that recently raised $6 million USD to support their Go-To-Market strategy.

[Alpic.ai](https://alpic.ai) provides managed hosting for MCP servers with:
- **Streamable HTTP transport** support (built-in)
- Automatic scaling and load balancing
- Built-in monitoring and observability
- Enterprise-grade security and compliance

### How to Deploy

1. Visit [Alpic.ai](https://alpic.ai)
2. Connect your GitHub repository: `laurentknauss/mcp-notion-server`
3. Set your `NOTION_API_TOKEN` environment variable in Alpic.ai dashboard
4. The platform automatically detects the streamable HTTP transport configuration
5. Your MCP server is deployed and ready to use

## Features

### Available Tools

- **notion_search** - Search for pages and databases in Notion
- **notion_retrieve_page** - Get page content and properties
- **notion_retrieve_block_children** - Read block content from pages
- **notion_query_database** - Query database with filters and sorting
- **notion_retrieve_database** - Get database schema and information
- **notion_append_block_children** - Add content to pages
- **notion_create_database_item** - Create new database entries
- **notion_update_page_properties** - Update page or database item properties
- **notion_delete_block** - Delete blocks from pages

## Configuration

### Environment Variables

- **`NOTION_API_TOKEN`** (required) - Your Notion integration token
- **`PORT`** or **`MCP_HTTP_PORT`** (optional) - Server port (default: 3000)

### Getting a Notion API Token

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the integration token
4. Share your Notion pages/databases with the integration

## Technical Details

- Built with **TypeScript** and **Express**
- Uses official **@modelcontextprotocol/sdk** for streamable HTTP transport
- Uses **Notion's official API** with authentication
- Node.js 20+ required
- Fully compatible with MCP protocol specification
- Returns JSON formatted responses

## Local Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Start server (requires NOTION_API_TOKEN environment variable)
NOTION_API_TOKEN=your_token_here pnpm start

# Development with hot reload
NOTION_API_TOKEN=your_token_here pnpm dev
```

The server will start on port 3000 by default (configurable via `PORT` or `MCP_HTTP_PORT` environment variable).

## License

MIT License - See LICENSE file for details

## Author

Laurent Knauss
