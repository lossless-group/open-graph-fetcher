***
![Open Graph Fetcher Obsidian Plugin Banner Image](https://i.imgur.com/0v6sPkv.png)
***

# Open Graph Fetcher Obsidian Plugin

An Obsidian plugin that allows you to fetch Open Graph data from a URL using OpenGraph.io.

## Features

### Command: Fetch Open Graph Data

- Opens a modal where the user can configure:
    - Whether to overwrite existing Open Graph data
    - Whether to create new Open Graph data if missing
    - Whether to write errors to YAML frontmatter
    - Whether to update fetch date for processed files
- Fetch Open Graph data from a URL using OpenGraph.io
- See Progress and Status
- Handle errors gracefully and display feedback
- Returns Open Graph data to YAML frontmatter

### Coming Soon:

#### Command: Batch Fetch Open Graph Data

- Select multiple files to process at once
- Pause and resume processing
- Skip files with existing Open Graph data
- Update fetch date for processed files
- Write errors to YAML frontmatter
- Configure delay between requests

## Getting Started

```
pnpm install
pnpm add -D esbuild @types/node builtin-modules
pnpm build
pnpm dev
```

## Packages, Dependencies, Libraries:

```json
"devDependencies": {
   "@types/node": "^24.0.12",
   "@typescript-eslint/eslint-plugin": "8.36.0",
   "@typescript-eslint/parser": "8.36.0",
   "builtin-modules": "5.0.0",
   "esbuild": "0.25.6",
   "eslint": "^9.30.1",
   "obsidian": "latest",
   "tslib": "2.8.1",
   "typescript": "5.8.3"
},
"dependencies": {
   "@modelcontextprotocol/sdk": "^1.15.0",
   "fastify": "^5.4.0",
   "zod": "^4.0.0"
}
```

## Using Symbolic Links to Test Your Plugin

If you're like us, you have a directory housing all your code projects. To use your plugin as you develop it, just create a symbolic link. Here is my example, but you will need to use your own path structure:

```bash
ln -s /Users/mpstaton/code/lossless-monorepo/obsidian-plugin-starter /Users/mpstaton/content-md/lossless/.obsidian/plugins/
```
