export const config = {
  MCP_HTTP_PORT: parseInt(process.env.MCP_HTTP_PORT || process.env.PORT || "3000", 10),
  NOTION_API_TOKEN: process.env.NOTION_API_TOKEN || "",
};
