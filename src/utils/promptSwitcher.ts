import { EXPERIMENTAL_PROMPTS } from './promptConfig';

// Default prompt key
const DEFAULT_PROMPT_KEY = 'default';

// Local storage key for storing the current prompt
const STORAGE_KEY = 'muze_studio_prompt_key';

/**
 * Get all available prompt keys
 * @returns Array of available prompt keys
 */
export function getAvailablePromptKeys(): string[] {
  return Object.keys(EXPERIMENTAL_PROMPTS);
}

/**
 * Get the current prompt key from local storage or default
 * @returns The current prompt key
 */
export function getCurrentPromptKey(): string {
  try {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey && EXPERIMENTAL_PROMPTS[storedKey]) {
      return storedKey;
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
  
  return DEFAULT_PROMPT_KEY;
}

/**
 * Set the current prompt key in local storage
 * @param key The prompt key to set
 * @returns boolean indicating success
 */
export function setCurrentPromptKey(key: string): boolean {
  if (!EXPERIMENTAL_PROMPTS[key]) {
    console.error(`Invalid prompt key: ${key}`);
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, key);
    return true;
  } catch (error) {
    console.error('Error setting localStorage:', error);
    return false;
  }
} 