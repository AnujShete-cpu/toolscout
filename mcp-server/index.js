#!/usr/bin/env node

/**
 * ToolScout MCP Server
 * Model Context Protocol server enabling AI agents to automate website scraping,
 * categorization, validation, and catalog management for ToolScout.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONSTANTS_PATH = path.resolve(__dirname, '../src/constants.ts');

/**
 * Read tools from constants.ts
 */
function readToolsFromConstants() {
  const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
  const match = content.match(/export const TOOLS: Tool\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('Could not parse TOOLS array from constants.ts');
  }
  // Safe evaluation of the array literal
  try {
    const fn = new Function(`return ${match[1]}`);
    return fn();
  } catch (err) {
    throw new Error('Failed to evaluate TOOLS array: ' + err.message);
  }
}

/**
 * Write updated tools back to constants.ts preserving TypeScript formatting
 */
function writeToolsToConstants(tools) {
  const sorted = [...tools].sort((a, b) => a.id - b.id);
  const formattedLines = sorted.map(t => {
    return `  ` + JSON.stringify(t);
  }).join(',\n');

  const newContent = `import { Tool } from './types';\n\nexport const TOOLS: Tool[] = [\n${formattedLines}\n];\n`;
  fs.writeFileSync(CONSTANTS_PATH, newContent, 'utf-8');
}

/**
 * Heuristic metadata extractor for AI websites
 */
function extractMetadata(url, html = '') {
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  const parsedUrl = new URL(cleanUrl);
  const hostname = parsedUrl.hostname.replace(/^www\./, '');
  const domainName = hostname.split('.')[0];
  const capitalizedName = domainName.charAt(0).toUpperCase() + domainName.slice(1);

  // Parse title and meta description from HTML if available
  let title = capitalizedName;
  let desc = `Smart AI-powered platform for modern digital workflows.`;

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].split(/[|\-–:]/)[0].trim() || capitalizedName;
  }

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch && descMatch[1]) {
    desc = descMatch[1].trim();
  }

  const corpus = (cleanUrl + ' ' + title + ' ' + desc).toLowerCase();

  let cat = 'productivity';
  let catLabel = 'Productivity';
  let icon = '⚡';
  let tags = ['ai', 'productivity'];
  let price = 'Freemium';

  if (corpus.includes('code') || corpus.includes('dev') || corpus.includes('git') || corpus.includes('copilot') || corpus.includes('ide') || corpus.includes('cursor') || corpus.includes('v0')) {
    cat = 'coding';
    catLabel = 'Coding';
    icon = '💻';
    tags = ['coding', 'developer', 'assistant'];
  } else if (corpus.includes('video') || corpus.includes('film') || corpus.includes('animation') || corpus.includes('runway') || corpus.includes('pika') || corpus.includes('sora')) {
    cat = 'video';
    catLabel = 'Video';
    icon = '🎬';
    tags = ['video', 'generation', 'editor'];
  } else if (corpus.includes('image') || corpus.includes('photo') || corpus.includes('art') || corpus.includes('midjourney')) {
    cat = 'image';
    catLabel = 'Image';
    icon = '🖼️';
    tags = ['image', 'art', 'design'];
  } else if (corpus.includes('voice') || corpus.includes('audio') || corpus.includes('music') || corpus.includes('speech') || corpus.includes('eleven')) {
    cat = 'audio';
    catLabel = 'Audio';
    icon = '🎙️';
    tags = ['audio', 'voice', 'music'];
  } else if (corpus.includes('write') || corpus.includes('copy') || corpus.includes('blog') || corpus.includes('seo')) {
    cat = 'writing';
    catLabel = 'Writing';
    icon = '✍️';
    tags = ['writing', 'copywriting', 'seo'];
  } else if (corpus.includes('chat') || corpus.includes('bot') || corpus.includes('gpt') || corpus.includes('assistant')) {
    cat = 'chatbot';
    catLabel = 'Chatbot';
    icon = '💬';
    tags = ['chatbot', 'assistant', 'llm'];
  } else if (corpus.includes('agent') || corpus.includes('automation') || corpus.includes('autonomous')) {
    cat = 'agent';
    catLabel = 'Agent';
    icon = '🤖';
    tags = ['agent', 'automation', 'workflows'];
  } else if (corpus.includes('data') || corpus.includes('analytics') || corpus.includes('bi')) {
    cat = 'data';
    catLabel = 'Data';
    icon = '📊';
    tags = ['data', 'analytics', 'insights'];
  }

  return {
    name: title,
    url: cleanUrl,
    cat,
    catLabel,
    icon,
    desc,
    tags,
    price,
    priceClass: price.toLowerCase().includes('free') ? 'free' : '',
    rating: 4.8,
    ratingCount: '500+',
    stars: '★★★★★',
    badges: [{ type: 'new', label: 'New' }],
    featured: false,
    match: `${title.toLowerCase()} ${cat} ${tags.join(' ')} ${desc.toLowerCase()}`
  };
}

/**
 * Initialize MCP Server
 */
const server = new Server(
  {
    name: 'toolscout-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_website',
        description: 'Add a new AI tool/website directly to the ToolScout catalog. Supports auto-scraping metadata from URL.',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'The website URL (e.g. https://gamma.app)' },
            name: { type: 'string', description: 'Optional custom name. If omitted, extracted from website metadata.' },
            category: { type: 'string', description: 'Optional category (video, image, writing, audio, coding, agent, chatbot, data, productivity, marketing)' },
            description: { type: 'string', description: 'Optional description of the tool.' },
            price: { type: 'string', description: 'Pricing model (Free, Freemium, Paid)' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags associated with tool' },
            icon: { type: 'string', description: 'Emoji icon representation (e.g. 🤖, 💻, 🎬)' },
            featured: { type: 'boolean', description: 'Whether to feature this tool on the homepage' },
          },
          required: ['url'],
        },
      },
      {
        name: 'list_websites',
        description: 'List and search tools in the ToolScout catalog.',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by category (e.g. coding, video, agent)' },
            query: { type: 'string', description: 'Search query across name, description, tags' },
            limit: { type: 'number', description: 'Max number of tools to return (default 20)' },
          },
        },
      },
      {
        name: 'delete_website',
        description: 'Delete a tool from the ToolScout catalog by ID or exact Name.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The ID of the tool to remove' },
            name: { type: 'string', description: 'The name of the tool to remove' },
          },
        },
      },
      {
        name: 'batch_add_websites',
        description: 'Batch add multiple AI website URLs in a single call.',
        inputSchema: {
          type: 'object',
          properties: {
            urls: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of website URLs to add'
            },
          },
          required: ['urls'],
        },
      },
      {
        name: 'get_catalog_stats',
        description: 'Get total tool count and category breakdown for ToolScout.',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  };
});

// Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tools = readToolsFromConstants();

  if (name === 'add_website') {
    const url = args.url;
    let meta = extractMetadata(url);

    if (args.name) meta.name = args.name;
    if (args.category) {
      meta.cat = args.category;
      meta.catLabel = args.category.charAt(0).toUpperCase() + args.category.slice(1);
    }
    if (args.description) meta.desc = args.description;
    if (args.price) meta.price = args.price;
    if (args.tags) meta.tags = args.tags;
    if (args.icon) meta.icon = args.icon;
    if (typeof args.featured === 'boolean') meta.featured = args.featured;

    const maxId = tools.reduce((max, t) => Math.max(max, t.id), 0);
    const newId = maxId + 1;

    const newTool = {
      id: newId,
      ...meta,
    };

    tools.push(newTool);
    writeToolsToConstants(tools);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully added "${newTool.name}" (ID: ${newTool.id}) to ToolScout!\nCategory: ${newTool.catLabel} | Price: ${newTool.price}\nURL: ${newTool.url}\nTotal Catalog: ${tools.length} tools.`,
        },
      ],
    };
  }

  if (name === 'list_websites') {
    let result = tools;
    if (args.category) {
      result = result.filter(t => t.cat.toLowerCase() === args.category.toLowerCase());
    }
    if (args.query) {
      const q = args.query.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    const limit = args.limit || 20;
    const paginated = result.slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(paginated, null, 2),
        },
      ],
    };
  }

  if (name === 'delete_website') {
    let index = -1;
    if (args.id) {
      index = tools.findIndex(t => t.id === Number(args.id));
    } else if (args.name) {
      index = tools.findIndex(t => t.name.toLowerCase() === args.name.toLowerCase());
    }

    if (index === -1) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Tool not found.` }],
      };
    }

    const removed = tools.splice(index, 1)[0];
    writeToolsToConstants(tools);

    return {
      content: [
        {
          type: 'text',
          text: `🗑️ Successfully removed "${removed.name}" (ID: ${removed.id}). Total tools remaining: ${tools.length}.`,
        },
      ],
    };
  }

  if (name === 'batch_add_websites') {
    const urls = args.urls || [];
    const added = [];
    let maxId = tools.reduce((max, t) => Math.max(max, t.id), 0);

    for (const url of urls) {
      const meta = extractMetadata(url);
      maxId++;
      const tool = {
        id: maxId,
        ...meta,
      };
      tools.push(tool);
      added.push(tool.name);
    }

    writeToolsToConstants(tools);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Batch added ${added.length} tools: ${added.join(', ')}. Total catalog: ${tools.length} tools.`,
        },
      ],
    };
  }

  if (name === 'get_catalog_stats') {
    const breakdown = {};
    for (const t of tools) {
      breakdown[t.catLabel] = (breakdown[t.catLabel] || 0) + 1;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ totalTools: tools.length, categoryBreakdown: breakdown }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start Server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ToolScout MCP Server running on stdio');
}

run().catch((error) => {
  console.error('MCP Server Error:', error);
  process.exit(1);
});
