import { fail } from "../../shared/errors";

export const CATEGORIES = ["power tools", "hand tools", "garden", "kitchen", "camping", "cleaning", "other"] as const;
export const CONDITIONS = ["like new", "good", "fair", "worn"] as const;
export type Category = (typeof CATEGORIES)[number];
export type Condition = (typeof CONDITIONS)[number];

export type ToolInput = { name: string; category: Category; condition: Condition; description: string };

const LIMITS = { name: 60, description: 280 };

export function validateToolInput(input: ToolInput): ToolInput {
  const name = input.name.trim();
  const description = input.description.trim();
  if (name.length < 2 || name.length > LIMITS.name) {
    fail("INVALID", `Name must be 2 to ${LIMITS.name} characters.`);
  }
  if (description.length > LIMITS.description) {
    fail("INVALID", `Description must be at most ${LIMITS.description} characters.`);
  }
  if (!CATEGORIES.includes(input.category)) fail("INVALID", "Unknown category.");
  if (!CONDITIONS.includes(input.condition)) fail("INVALID", "Unknown condition.");
  return { ...input, name, description };
}
