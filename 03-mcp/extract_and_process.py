#!/usr/bin/env python3
"""
Script to iterate over all zip files in the current directory,
extract their contents, and process all markdown files found.
"""

import os
import zipfile
from pathlib import Path

from minsearch import Index

def extract_zip(zip_path, extract_to):
    """Extract the contents of a zip file to the specified directory."""
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)

def process_markdown_files(root_dir):
    """Process all markdown files in the extracted content."""
    markdown_data = {}
    
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, root_dir)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                markdown_data[relative_path] = content
    
    return markdown_data

def main():
    """Main function to iterate over zip files and process markdown files."""
    current_dir = os.getcwd()
    markdown_data = {}
    
    for file in os.listdir(current_dir):
        if file.endswith('.zip'):
            zip_path = os.path.join(current_dir, file)
            extract_dir = os.path.join(current_dir, file.replace('.zip', ''))
            
            print(f"Extracting {file} to {extract_dir}")
            extract_zip(zip_path, extract_dir)
            
            print(f"Processing markdown files in {extract_dir}")
            zip_markdown_data = process_markdown_files(extract_dir)
            
            markdown_data.update(zip_markdown_data)
    
    return markdown_data

if __name__ == "__main__":
    index = Index(text_fields=["path", "content"])
    result = main()
    print("\nMarkdown files processed:")
    docs = []
    for path, content in result.items():
        docs.append({ "path": path, "content": content})
    index.fit(docs)
    for r in index.search("demo", num_results=5):
        print(r['path'])
