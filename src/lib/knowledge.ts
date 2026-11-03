import { readFileSync } from "fs";
import path from "path";

let cachedKnowledge: string | null = null;

export function getKnowledgeBase(): string {
  if (!cachedKnowledge) {
    const filePath = path.join(process.cwd(), "src/data/legalaid_knowledge.txt");
    cachedKnowledge = readFileSync(filePath, "utf-8");
  }
  return cachedKnowledge;
}
