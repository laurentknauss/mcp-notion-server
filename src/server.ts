import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { NotionClientWrapper } from "./client/index.js";
import { config } from "./config.js";

export function getServer(): McpServer {
  const server = new McpServer(
    {
      name: "mcp-notion-server",
      version: "2.0.0",
    },
    {
      capabilities: {},
    },
  );

  // Initialize Notion client
  if (!config.NOTION_API_TOKEN) {
    throw new Error("NOTION_API_TOKEN environment variable is required");
  }

  const notionClient = new NotionClientWrapper(config.NOTION_API_TOKEN);

  // Tool 1: Search Notion (most useful for finding pages/databases)
  server.tool(
    "notion_search",
    "Search for pages and databases in Notion",
    {
      query: z.string().optional().describe("Search query text"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ query, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.search(query);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  );

  // Tool 2: Retrieve a page
  server.tool(
    "notion_retrieve_page",
    "Retrieve a page from Notion",
    {
      page_id: z.string().describe("The ID of the page to retrieve"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ page_id, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.retrievePage(page_id);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Failed to retrieve page: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // Tool 3: Retrieve block children (for reading page content)
  server.tool(
    "notion_retrieve_block_children",
    "Retrieve the children of a block",
    {
      block_id: z.string().describe("The ID of the block"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ block_id, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.retrieveBlockChildren(block_id);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Failed to retrieve block children: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // Tool 4: Query database
  server.tool(
    "notion_query_database",
    "Query a Notion database",
    {
      database_id: z.string().describe("The ID of the database to query"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ database_id, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.queryDatabase(database_id);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Database query failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // Tool 5: Retrieve database
  server.tool(
    "notion_retrieve_database",
    "Retrieve a database from Notion",
    {
      database_id: z.string().describe("The ID of the database to retrieve"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ database_id, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.retrieveDatabase(database_id);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Failed to retrieve database: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // Tool 6: Append block children (for adding content)
  server.tool(
    "notion_append_block_children",
    "Append new children blocks to a specified parent block",
    {
      block_id: z.string().describe("The ID of the parent block"),
      children: z.array(z.any()).describe("Array of block objects to append"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ block_id, children, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.appendBlockChildren(block_id, children);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Failed to append blocks: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // Tool 7: Create database item
  server.tool(
    "notion_create_database_item",
    "Create a new item (page) in a Notion database",
    {
      database_id: z.string().describe("The ID of the database"),
      properties: z.any().describe("Properties of the new database item"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ database_id, properties, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.createDatabaseItem(database_id, properties);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Failed to create database item: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // Tool 8: Update page properties
  server.tool(
    "notion_update_page_properties",
    "Update properties of a page or database item",
    {
      page_id: z.string().describe("The ID of the page to update"),
      properties: z.any().describe("Properties to update"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ page_id, properties, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.updatePageProperties(page_id, properties);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Failed to update page properties: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // Tool 9: Delete block
  server.tool(
    "notion_delete_block",
    "Delete a block in Notion",
    {
      block_id: z.string().describe("The ID of the block to delete"),
      format: z.enum(["json", "markdown"]).default("markdown").describe("Response format"),
    },
    async ({ block_id, format }): Promise<CallToolResult> => {
      try {
        const response = await notionClient.deleteBlock(block_id);

        if (format === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        throw new Error(
          `Failed to delete block: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  return server;
}
