import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility helper to merge tailwind CSS classes dynamically,
 * resolving tailwind conflicts.
 * 
 * @param {...any} inputs List of class inputs
 * @returns {string} Clean combined class list string
 * @author Arnav Garg
 * @version 1.0.0
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
