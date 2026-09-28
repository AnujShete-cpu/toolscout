import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSTANTS_PATH = path.resolve(__dirname, '../src/constants.ts');

const urlArg = process.argv[2];
if (!urlArg) {
  console.log(`\nUsage: npm run add:tool <website_url> [custom_name] [category]\nExample: npm run add:tool https://gamma.app "Gamma" presentation\n`);
  process.exit(1);
}

let cleanUrl = urlArg.trim();
if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
  cleanUrl = 'https://' + cleanUrl;
}

const parsed = new URL(cleanUrl);
const hostname = parsed.hostname.replace(/^www\./, '');
const domainParts = hostname.split('.');
const rawName = domainParts[0] || 'AI Tool';
const customName = process.argv[3] || (rawName.charAt(0).toUpperCase() + rawName.slice(1));
const customCat = process.argv[4];

// Read existing constants
const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
const match = content.match(/export const TOOLS: Tool\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not parse constants.ts');
  process.exit(1);
}

const tools = new Function(`return ${match[1]}`)();
const maxId = tools.reduce((max, t) => Math.max(max, t.id), 0);
const newId = maxId + 1;

let category = customCat || 'productivity';
let catLabel = customCat ? (customCat.charAt(0).toUpperCase() + customCat.slice(1)) : 'Productivity';
let icon = '⚡';
let tags = ['ai', category];
let desc = `Smart AI-powered platform for modern digital workflows.`;

const corpus = (cleanUrl + ' ' + customName).toLowerCase();
if (corpus.includes('code') || corpus.includes('dev') || corpus.includes('git') || corpus.includes('ide')) {
  category = 'coding'; catLabel = 'Coding'; icon = '💻'; tags = ['coding', 'developer', 'assistant']; desc = 'AI developer assistant to accelerate coding workflows.';
} else if (corpus.includes('video') || corpus.includes('film') || corpus.includes('anim')) {
  category = 'video'; catLabel = 'Video'; icon = '🎬'; tags = ['video', 'generation', 'editor']; desc = 'Next-gen AI video creation and editing suite.';
} else if (corpus.includes('image') || corpus.includes('photo') || corpus.includes('art')) {
  category = 'image'; catLabel = 'Image'; icon = '🖼️'; tags = ['image', 'art', 'design']; desc = 'Create, enhance, and transform high-resolution images.';
} else if (corpus.includes('audio') || corpus.includes('voice') || corpus.includes('music') || corpus.includes('sound')) {
  category = 'audio'; catLabel = 'Audio'; icon = '🎙️'; tags = ['audio', 'voice', 'music']; desc = 'Synthetic voice, music creation, and audio tools.';
} else if (corpus.includes('write') || corpus.includes('copy') || corpus.includes('blog')) {
  category = 'writing'; catLabel = 'Writing'; icon = '✍️'; tags = ['writing', 'copywriting', 'seo']; desc = 'Generate high-converting copy and articles.';
} else if (corpus.includes('agent') || corpus.includes('auto')) {
  category = 'agent'; catLabel = 'Agent'; icon = '🤖'; tags = ['agent', 'automation']; desc = 'Autonomous AI agent platform for multi-step tasks.';
}

const newTool = {
  id: newId,
  name: customName,
  cat: category,
  catLabel: catLabel,
  icon: icon,
  match: `${customName.toLowerCase()} ${category} ${tags.join(' ')} ${desc.toLowerCase()}`,
  desc: desc,
  tags: tags,
  badges: [{ type: 'new', label: 'New' }],
  price: 'Freemium',
  priceClass: 'freemium',
  rating: 4.8,
  ratingCount: '100+',
  stars: '★★★★★',
  featured: false,
  url: cleanUrl
};

tools.push(newTool);
const sorted = tools.sort((a, b) => a.id - b.id);
const formattedLines = sorted.map(t => `  ` + JSON.stringify(t)).join(',\n');
const newContent = `import { Tool } from './types';\n\nexport const TOOLS: Tool[] = [\n${formattedLines}\n];\n`;

fs.writeFileSync(CONSTANTS_PATH, newContent, 'utf-8');
console.log(`\n🎉 Successfully added "${newTool.name}" (ID: ${newTool.id}) to ToolScout!`);
console.log(`Category: ${newTool.catLabel} | URL: ${newTool.url}`);
console.log(`Total tools in directory: ${tools.length}\n`);
