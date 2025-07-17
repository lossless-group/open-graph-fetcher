import { TFile } from 'obsidian';

/**
 * Extracts frontmatter from markdown content using regex only - no YAML libraries
 * @param content The markdown content
 * @returns The extracted frontmatter as an object, or null if no frontmatter is found
 */
export function extractFrontmatter(content: string): Record<string, any> | null {
  if (!content) return null;

  const frontmatterRegex = /^---\n((?:.|\n)*?)\n---/;
  const match = content.match(frontmatterRegex);
  if (!match || !match[1]) return null;

  const frontmatterContent = match[1].trim();
  const frontmatterObject: Record<string, any> = {};
  
  const lines = frontmatterContent.split('\n');
  let currentArrayProperty: string | null = null;
  let arrayValues: any[] = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.startsWith('- ') && currentArrayProperty) {
      arrayValues.push(line.substring(2).trim());
      continue;
    }
    
    if (currentArrayProperty && !line.startsWith('- ')) {
      frontmatterObject[currentArrayProperty] = arrayValues;
      currentArrayProperty = null;
      arrayValues = [];
    }
    
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      if (!value) {
        currentArrayProperty = key;
        arrayValues = [];
        continue;
      }
      
      if (value === 'null') {
        frontmatterObject[key] = null;
      } else if (value === 'true') {
        frontmatterObject[key] = true;
      } else if (value === 'false') {
        frontmatterObject[key] = false;
      } else if (!isNaN(Number(value)) && !value.startsWith('0')) {
        frontmatterObject[key] = value.includes('.') ? parseFloat(value) : parseInt(value);
      } else {
        const trimmedValue = (value.startsWith('"') && value.endsWith('"')) || 
                            (value.startsWith("'") && value.endsWith("'")) 
                          ? value.substring(1, value.length - 1)
                          : value;
        frontmatterObject[key] = trimmedValue;
      }
    }
  }
  
  if (currentArrayProperty) {
    frontmatterObject[currentArrayProperty] = arrayValues;
  }
  
  return frontmatterObject;
}

/**
 * Formats frontmatter as YAML with consistent quoting
 * @param frontmatter The frontmatter object
 * @returns Formatted YAML string
 */
export function formatFrontmatter(frontmatter: Record<string, any>): string {
  return Object.entries(frontmatter)
    .map(([key, value]) => {
      if (value === null) return `${key}: null`;
      if (value === true) return `${key}: true`;
      if (value === false) return `${key}: false`;
      if (typeof value === 'number') return `${key}: ${value}`;
      if (Array.isArray(value)) {
        // Handle arrays properly - don't quote the array itself
        if (value.length === 0) {
          return `${key}: []`;
        }
        const items = value.map(item => `  - ${item}`).join('\n');
        return `${key}:\n${items}`;
      }
      // Only quote string values that need quoting (contain spaces, special chars, etc.)
      if (typeof value === 'string') {
        // Check if the string needs quoting
        const needsQuoting = /[\s:{}\[\]|>*&!%#`@,]/.test(value) || 
                            value.startsWith('-') || 
                            value === '' ||
                            /^(true|false|null|\d+(\.\d+)?)$/.test(value);
        return needsQuoting ? `${key}: "${value}"` : `${key}: ${value}`;
      }
      // Fallback for other types
      return `${key}: "${String(value)}"`;
    })
    .join('\n');
}

/**
 * Updates a file with new frontmatter content
 * @param file The Obsidian file
 * @param newFrontmatter The new frontmatter content
 * @returns Promise<void>
 */
export async function updateFileFrontmatter(file: TFile, newFrontmatter: string): Promise<void> {
  const content = await file.vault.read(file);
  const frontmatterRegex = /^---\n((?:.|\n)*?)\n---/;
  
  // If file has frontmatter, replace it
  if (content.match(frontmatterRegex)) {
    const newContent = content.replace(frontmatterRegex, `---\n${newFrontmatter}\n---`);
    await file.vault.modify(file, newContent);
  } else {
    // If no frontmatter, add it at the start
    const newContent = `---\n${newFrontmatter}\n---\n${content}`;
    await file.vault.modify(file, newContent);
  }
}
