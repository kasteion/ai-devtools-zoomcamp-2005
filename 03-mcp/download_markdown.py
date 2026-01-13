#!/usr/bin/env python3
"""
Script for downloading the content of any web page in markdown using Jina.
Usage: python download_markdown.py <URL>
Example: python download_markdown.py https://datatalks.club
"""

import requests
import sys
import os

def download_markdown(url):
    """Download the markdown content of a web page using Jina."""
    # Construct the Jina API URL
    jina_url = f"https://r.jina.ai/{url}"
    
    try:
        # Send a GET request to the Jina API
        response = requests.get(jina_url)
        response.raise_for_status()  # Raise an error for bad status codes
        
        # Extract the domain name for the output filename
        domain = url.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        # filename = f"{domain}.md"

        return response.text
        # print(len(response.text))
        
        # Save the content to a markdown file
        # with open(filename, "w", encoding="utf-8") as file:
            # file.write(response.text)
        
        # print(f"Markdown content saved to {filename}")
        # return filename
    except requests.exceptions.RequestException as e:
        print(f"Error downloading markdown content: {e}")
        return None

def count_word(text:str, word:str):
    result = text.count(word)
    return result

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python download_markdown.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    markdown = download_markdown(url)
    print(count_word(markdown, "data"))