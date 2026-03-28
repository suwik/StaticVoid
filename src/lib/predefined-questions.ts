import fs from "fs";
import path from "path";

export interface PredefinedQuestion {
  label: string;
  question: string;
  markScheme: string;
}

function extractSection(content: string, heading: string): string {
  const lines = content.split("\n");
  const startIndex = lines.findIndex((line) =>
    line.trim().startsWith(`## ${heading}`)
  );
  if (startIndex === -1) return "";

  const sectionLines: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith("## ")) break;
    sectionLines.push(lines[i]);
  }

  return sectionLines.join("\n").trim();
}

function extractQuestion(essayQuestionSection: string): string {
  const match = essayQuestionSection.match(new RegExp('\\*\\*Question:\\*\\*\\s*"?(.+?)"?\\s*$', 'ms'));
  if (match) return match[1].trim().replace(/^"(.*)"$/, "$1");
  // Fallback: return full section text
  return essayQuestionSection;
}

function extractLabel(essayQuestionSection: string): string {
  const match = essayQuestionSection.match(/\*\*Topic:\*\*\s*(.+)/);
  return match ? match[1].trim() : "Untitled";
}

export function loadPredefinedQuestions(): PredefinedQuestion[] {
  const questionsDir = path.join(process.cwd(), "questions");

  if (!fs.existsSync(questionsDir)) return [];

  const files = fs
    .readdirSync(questionsDir)
    .filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const content = fs.readFileSync(path.join(questionsDir, file), "utf-8");
    const essaySection = extractSection(content, "Essay Question");
    const rubricSection = extractSection(content, "Scoring Rubric");

    return {
      label: extractLabel(essaySection),
      question: extractQuestion(essaySection),
      markScheme: rubricSection,
    };
  });
}
