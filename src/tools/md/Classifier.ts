export type Category = "ideaMuseum" | "myNotes" | "uncategorized";

export interface ClassificationResult {
  category: Category;
  confidence: number;
  reason: string;
}

const IDEA_KEYWORDS = [
  "随笔", "日记", "感想", "想法", "思考", "感悟", "杂谈",
  "今日", "今天", "记录", "日常", "碎片", "灵感",
  "life", "daily", "thought", "idea", "random",
];

const NOTES_KEYWORDS = [
  "数学", "物理", "化学", "生物", "计算机", "编程", "算法",
  "学习", "笔记", "知识", "理论", "公式", "定理",
  "math", "physics", "computer", "science", "study", "note",
];

export class Classifier {
  static classify(content: string, filename: string): ClassificationResult {
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    const ideaScore = IDEA_KEYWORDS.filter(
      (kw) => lowerContent.includes(kw.toLowerCase()) || lowerFilename.includes(kw.toLowerCase())
    ).length;

    const notesScore = NOTES_KEYWORDS.filter(
      (kw) => lowerContent.includes(kw.toLowerCase()) || lowerFilename.includes(kw.toLowerCase())
    ).length;

    if (ideaScore > notesScore) {
      return {
        category: "ideaMuseum",
        confidence: ideaScore / (ideaScore + notesScore + 1),
        reason: `Found ${ideaScore} idea-related keywords`,
      };
    }

    if (notesScore > ideaScore) {
      return {
        category: "myNotes",
        confidence: notesScore / (ideaScore + notesScore + 1),
        reason: `Found ${notesScore} notes-related keywords`,
      };
    }

    return {
      category: "uncategorized",
      confidence: 0,
      reason: "No strong keywords found, defaulting to uncategorized",
    };
  }

  static getCategoryFolder(category: Category): string {
    switch (category) {
      case "ideaMuseum":
        return "%ideaMuseum";
      case "myNotes":
        return "%myNotes";
      default:
        return "%uncategorized";
    }
  }
}
