from fastmcp import FastMCP
from download_markdown import download_markdown

mcp = FastMCP("Demo 🚀")

@mcp.tool
def get_markdown_from_url(url:str) -> str:
    """Gets markdown from url"""
    return download_markdown(url)

if __name__ == "__main__":
    mcp.run()