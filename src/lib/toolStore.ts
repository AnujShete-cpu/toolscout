import { Tool } from '../types';
import { TOOLS as INITIAL_TOOLS } from '../constants';

const STORAGE_CUSTOM_TOOLS_KEY = 'toolscout_custom_tools';
const STORAGE_DELETED_IDS_KEY = 'toolscout_deleted_tool_ids';
const STORAGE_MODIFIED_TOOLS_KEY = 'toolscout_modified_tools';

export const TOOL_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'writing', label: 'Writing', icon: '✍️' },
  { value: 'audio', label: 'Audio', icon: '🎙️' },
  { value: 'coding', label: 'Coding', icon: '💻' },
  { value: 'generation', label: 'Design & Generation', icon: '🎨' },
  { value: 'productivity', label: 'Productivity', icon: '⚡' },
  { value: 'marketing', label: 'Marketing', icon: '📈' },
  { value: 'agent', label: 'AI Agent', icon: '🤖' },
  { value: 'chatbot', label: 'Chatbot', icon: '💬' },
  { value: 'data', label: 'Data & Analytics', icon: '📊' },
  { value: 'document', label: 'Document & PDF', icon: '📄' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'hr', label: 'HR & Recruiting', icon: '👥' },
  { value: 'meeting', label: 'Meeting Assistant', icon: '📅' },
  { value: 'presentation', label: 'Presentations & Slides', icon: '📊' },
  { value: 'support', label: 'Customer Support', icon: '🎧' },
  { value: 'infrastructure', label: 'Infrastructure & APIs', icon: '🏗️' },
  { value: 'no-code', label: 'No-Code Builders', icon: '⚡' },
  { value: 'avatar', label: 'Avatars & Virtuals', icon: '👤' },
  { value: 'browser', label: 'Browser AI', icon: '🌐' },
];

export const getStoredCustomTools = (): Tool[] => {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_TOOLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load custom tools from localStorage:', e);
    return [];
  }
};

export const getDeletedToolIds = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getModifiedTools = (): Record<number, Partial<Tool>> => {
  try {
    const raw = localStorage.getItem(STORAGE_MODIFIED_TOOLS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

/**
 * Returns all active tools (Built-in + Custom - Deleted + Modified)
 */
export const getAllTools = (): Tool[] => {
  const customTools = getStoredCustomTools();
  const deletedIds = new Set(getDeletedToolIds());
  const modifiedMap = getModifiedTools();

  // Filter & patch initial tools
  const processedInitial = INITIAL_TOOLS
    .filter(t => !deletedIds.has(t.id))
    .map(t => (modifiedMap[t.id] ? { ...t, ...modifiedMap[t.id] } : t));

  // Process custom tools
  const processedCustom = customTools
    .filter(t => !deletedIds.has(t.id))
    .map(t => (modifiedMap[t.id] ? { ...t, ...modifiedMap[t.id] } : t));

  // Combine custom first or keep sorted
  return [...processedCustom, ...processedInitial];
};

export const getToolById = (id: number): Tool | undefined => {
  const tools = getAllTools();
  return tools.find(t => t.id === id);
};

export const notifyToolsChanged = () => {
  window.dispatchEvent(new CustomEvent('toolscout_tools_updated'));
};

/**
 * Add a new tool without code changes
 */
export const addTool = (toolData: Omit<Tool, 'id'> & { id?: number }): Tool => {
  const customTools = getStoredCustomTools();
  
  // Generate a unique ID (timestamp based or max + 1)
  const allTools = getAllTools();
  const maxId = allTools.reduce((max, t) => Math.max(max, t.id), 1000);
  const newId = toolData.id || maxId + 1;

  const newTool: Tool = {
    ...toolData,
    id: newId,
    stars: toolData.stars || '★★★★★',
    rating: toolData.rating || 4.8,
    ratingCount: toolData.ratingCount || '100+',
    featured: toolData.featured ?? false,
    priceClass: toolData.price.toLowerCase().includes('free') ? 'free' : toolData.price.toLowerCase().includes('freemium') ? 'freemium' : '',
  };

  const updatedCustom = [newTool, ...customTools];
  localStorage.setItem(STORAGE_CUSTOM_TOOLS_KEY, JSON.stringify(updatedCustom));
  
  notifyToolsChanged();
  return newTool;
};

/**
 * Edit an existing tool
 */
export const updateTool = (id: number, updates: Partial<Tool>): boolean => {
  const customTools = getStoredCustomTools();
  const customIndex = customTools.findIndex(t => t.id === id);

  if (customIndex !== -1) {
    customTools[customIndex] = { ...customTools[customIndex], ...updates };
    localStorage.setItem(STORAGE_CUSTOM_TOOLS_KEY, JSON.stringify(customTools));
  } else {
    // It's a built-in tool, save to modified map
    const modified = getModifiedTools();
    modified[id] = { ...(modified[id] || {}), ...updates };
    localStorage.setItem(STORAGE_MODIFIED_TOOLS_KEY, JSON.stringify(modified));
  }

  notifyToolsChanged();
  return true;
};

/**
 * Delete a tool
 */
export const deleteTool = (id: number): boolean => {
  // Remove from custom if present
  const customTools = getStoredCustomTools();
  const updatedCustom = customTools.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_CUSTOM_TOOLS_KEY, JSON.stringify(updatedCustom));

  // Add to deleted IDs
  const deletedIds = getDeletedToolIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem(STORAGE_DELETED_IDS_KEY, JSON.stringify(deletedIds));
  }

  notifyToolsChanged();
  return true;
};

/**
 * Reset all tools back to default catalog
 */
export const resetToDefaults = () => {
  localStorage.removeItem(STORAGE_CUSTOM_TOOLS_KEY);
  localStorage.removeItem(STORAGE_DELETED_IDS_KEY);
  localStorage.removeItem(STORAGE_MODIFIED_TOOLS_KEY);
  notifyToolsChanged();
};

/**
 * Export entire catalog as JSON
 */
export const exportCatalogJSON = (): string => {
  const tools = getAllTools();
  return JSON.stringify(tools, null, 2);
};

/**
 * Import tools from JSON
 */
export const importCatalogJSON = (jsonString: string): { success: boolean; count: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'JSON content must be an array of tools' };
    }

    let addedCount = 0;
    const customTools = getStoredCustomTools();
    const existingIds = new Set(getAllTools().map(t => t.id));

    const newToolsToSave = [...customTools];

    for (const item of parsed) {
      if (item.name && (item.url || item.desc)) {
        let toolId = item.id;
        if (!toolId || existingIds.has(toolId)) {
          toolId = Date.now() + Math.floor(Math.random() * 10000);
        }
        existingIds.add(toolId);

        const newTool: Tool = {
          id: toolId,
          name: item.name,
          cat: item.cat || 'productivity',
          catLabel: item.catLabel || 'Productivity',
          icon: item.icon || '⚡',
          match: item.match || `${item.name.toLowerCase()} ${item.cat || ''}`,
          desc: item.desc || 'AI powered tool',
          tags: Array.isArray(item.tags) ? item.tags : [item.cat || 'ai'],
          badges: Array.isArray(item.badges) ? item.badges : [{ type: 'new', label: 'New' }],
          price: item.price || 'Freemium',
          priceClass: (item.price || '').toLowerCase().includes('free') ? 'free' : '',
          rating: item.rating || 4.8,
          ratingCount: item.ratingCount || '100+',
          stars: item.stars || '★★★★★',
          featured: Boolean(item.featured),
          url: item.url || '#',
        };

        newToolsToSave.push(newTool);
        addedCount++;
      }
    }

    localStorage.setItem(STORAGE_CUSTOM_TOOLS_KEY, JSON.stringify(newToolsToSave));
    notifyToolsChanged();

    return { success: true, count: addedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Invalid JSON format' };
  }
};

/**
 * AI & Heuristic URL Auto-Extractor:
 * Given a URL or domain, automatically infers metadata (Name, Category, Description, Tags, Price, Emoji).
 */
export const extractToolMetaFromUrl = (inputUrl: string): Partial<Tool> => {
  let cleaned = inputUrl.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  let hostname = '';
  let pathname = '';
  try {
    const parsed = new URL(cleaned);
    hostname = parsed.hostname.replace(/^www\./, '');
    pathname = parsed.pathname;
  } catch (e) {
    hostname = inputUrl.replace(/^https?:\/\//, '').split('/')[0];
  }

  const domainParts = hostname.split('.');
  const rawName = domainParts[0] || 'AI Tool';
  const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Smart heuristic classification based on domain & path keywords
  const textCorpus = (cleaned + ' ' + rawName + ' ' + pathname).toLowerCase();

  let category = 'productivity';
  let catLabel = 'Productivity';
  let icon = '⚡';
  let tags = ['ai', 'productivity'];
  let desc = `Smart AI-powered platform for modern digital workflows.`;
  let price = 'Freemium';

  if (textCorpus.includes('code') || textCorpus.includes('dev') || textCorpus.includes('git') || textCorpus.includes('copilot') || textCorpus.includes('ide') || textCorpus.includes('script') || textCorpus.includes('stack') || textCorpus.includes('v0') || textCorpus.includes('replit') || textCorpus.includes('cursor')) {
    category = 'coding';
    catLabel = 'Coding';
    icon = '💻';
    tags = ['coding', 'developer', 'assistant', 'automation'];
    desc = `AI developer assistant and coding platform to accelerate software development.`;
  } else if (textCorpus.includes('video') || textCorpus.includes('film') || textCorpus.includes('clip') || textCorpus.includes('anim') || textCorpus.includes('sora') || textCorpus.includes('runway') || textCorpus.includes('pika')) {
    category = 'video';
    catLabel = 'Video';
    icon = '🎬';
    tags = ['video', 'generation', 'editor', 'creative'];
    desc = `Next-generation AI video generation and editing suite for creators.`;
  } else if (textCorpus.includes('image') || textCorpus.includes('photo') || textCorpus.includes('art') || textCorpus.includes('draw') || textCorpus.includes('midjourney') || textCorpus.includes('canvas')) {
    category = 'image';
    catLabel = 'Image';
    icon = '🖼️';
    tags = ['image', 'art', 'design', 'visuals'];
    desc = `Create, enhance, and transform high-resolution images with cutting-edge AI.`;
  } else if (textCorpus.includes('voice') || textCorpus.includes('audio') || textCorpus.includes('music') || textCorpus.includes('sound') || textCorpus.includes('speech') || textCorpus.includes('podcast') || textCorpus.includes('suno') || textCorpus.includes('eleven')) {
    category = 'audio';
    catLabel = 'Audio';
    icon = '🎙️';
    tags = ['audio', 'voice', 'music', 'text-to-speech'];
    desc = `State-of-the-art synthetic voice, music creation, and audio processing tools.`;
  } else if (textCorpus.includes('write') || textCorpus.includes('copy') || textCorpus.includes('blog') || textCorpus.includes('gramm') || textCorpus.includes('text') || textCorpus.includes('doc') || textCorpus.includes('quill')) {
    category = 'writing';
    catLabel = 'Writing';
    icon = '✍️';
    tags = ['writing', 'copywriting', 'seo', 'content'];
    desc = `Generate high-converting copy, articles, and refined prose in seconds.`;
  } else if (textCorpus.includes('chat') || textCorpus.includes('bot') || textCorpus.includes('gpt') || textCorpus.includes('claude') || textCorpus.includes('gemini') || textCorpus.includes('talk')) {
    category = 'chatbot';
    catLabel = 'Chatbot';
    icon = '💬';
    tags = ['chatbot', 'assistant', 'conversational', 'llm'];
    desc = `Intelligent conversational AI model capable of reasoning, analysis, and research.`;
  } else if (textCorpus.includes('agent') || textCorpus.includes('auto') || textCorpus.includes('crew') || textCorpus.includes('work')) {
    category = 'agent';
    catLabel = 'Agent';
    icon = '🤖';
    tags = ['agent', 'automation', 'autonomous', 'workflow'];
    desc = `Autonomous AI agent platform that executes complex multi-step tasks independently.`;
  } else if (textCorpus.includes('data') || textCorpus.includes('analyt') || textCorpus.includes('chart') || textCorpus.includes('sheet') || textCorpus.includes('bi')) {
    category = 'data';
    catLabel = 'Data';
    icon = '📊';
    tags = ['data', 'analytics', 'insights', 'business'];
    desc = `Turn raw data into actionable visual insights and predictive analytics with AI.`;
  } else if (textCorpus.includes('market') || textCorpus.includes('ad') || textCorpus.includes('social') || textCorpus.includes('seo') || textCorpus.includes('brand')) {
    category = 'marketing';
    catLabel = 'Marketing';
    icon = '📈';
    tags = ['marketing', 'ads', 'growth', 'social-media'];
    desc = `Supercharge campaigns, social growth, and marketing conversion with AI tools.`;
  }

  return {
    name: capitalizedName,
    url: cleaned,
    cat: category,
    catLabel: catLabel,
    icon: icon,
    desc: desc,
    tags: tags,
    match: `${capitalizedName.toLowerCase()} ${category} ${tags.join(' ')} ${desc.toLowerCase()}`,
    price: price,
    rating: 4.8,
    ratingCount: '500+',
    stars: '★★★★★',
    badges: [{ type: 'new', label: 'New' }],
    featured: false
  };
};
