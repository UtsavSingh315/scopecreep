import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine and merge CSS class names intelligently.
 *
 * @function cn
 * @param {...*} inputs - CSS class names, objects, or arrays
 * @returns {string} Merged class name string without conflicts
 *
 * @description
 * - Uses clsx to combine multiple class sources (strings, objects, arrays)
 * - Uses tailwind-merge to remove conflicting Tailwind classes
 * - Example: cn("px-2", "px-4") returns "px-4" (conflict resolved)
 * - Useful for component variants in Tailwind CSS projects
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
