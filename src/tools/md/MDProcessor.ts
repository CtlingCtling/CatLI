import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, basename, extname } from "path";
import { output } from "../../utils/logger.js";
import { YamlGenerator, YamlMetadata } from "./YamlGenerator.js";
import { Classifier, Category } from "./Classifier.js";

export interface ProcessOptions {
  inputDir: string;
  outputDir?: string;
  recursive?: boolean;
  includeSubdirs?: boolean;
  summaryMode?: "brief" | "detailed";
}

export interface ProcessedFile {
  path: string;
  filename: string;
  content: string;
  metadata?: YamlMetadata;
  summary?: string;
  error?: string;
  category?: Category;
}

export class MDProcessor {
  static processFile(filePath: string): ProcessedFile {
    try {
      const content = readFileSync(filePath, "utf-8");
      const filename = basename(filePath);
      const existingYaml = YamlGenerator.parse(content);

      const classification = Classifier.classify(content, filename);

      let processedContent = content;
      if (!existingYaml) {
        const metadata: YamlMetadata = {
          title: filename.replace(/\.md$/, ""),
          date: new Date().toISOString().split("T")[0],
          source: "",
          summary: "",
          tags: [classification.category],
        };
        processedContent = YamlGenerator.addYamlToContent(content, metadata);
      } else {
        const updatedYaml = { ...existingYaml, tags: [...(existingYaml.tags || []), classification.category] };
        processedContent = YamlGenerator.addYamlToContent(content, updatedYaml);
      }

      return {
        path: filePath,
        filename,
        content: processedContent,
        metadata: existingYaml || this.extractBasicMetadata(content, filename),
        category: classification.category,
      };
    } catch (err) {
      const error = err as Error;
      return {
        path: filePath,
        filename: basename(filePath),
        content: "",
        error: error.message,
      };
    }
  }

  static processDirectory(options: ProcessOptions): ProcessedFile[] {
    const results: ProcessedFile[] = [];
    const categoryFolders: Map<Category, string> = new Map();

    try {
      const files = this.findMarkdownFiles(options.inputDir, options.recursive || false);

      output(`Found ${files.length} markdown file(s) in ${options.inputDir}`);

      for (const file of files) {
        const result = this.processFile(file);
        results.push(result);

        if (result.error) {
          output(`[error] ${result.filename}: ${result.error}`);
        } else {
          output(`Processed: ${result.filename} -> ${result.category}`);

          if (options.outputDir && result.category) {
            const outputDir = options.outputDir;
            const categoryFolder = Classifier.getCategoryFolder(result.category);
            const targetDir = join(outputDir, categoryFolder);

            if (!categoryFolders.has(result.category)) {
              if (!existsSync(targetDir)) {
                mkdirSync(targetDir, { recursive: true });
                output(`Created folder: ${categoryFolder}`);
              }
              categoryFolders.set(result.category, targetDir);
            }

            const targetPath = join(targetDir, result.filename);
            writeFileSync(targetPath, result.content, "utf-8");
          }
        }
      }

      if (options.outputDir && results.length > 0) {
        const savedCount = results.filter((r) => !r.error && r.category).length;
        output(`\nSaved ${savedCount} file(s) to category folders in ${options.outputDir}`);
      }
    } catch (err) {
      const error = err as Error;
      output(`[error] Failed to process directory: ${error.message}`);
    }

    return results;
  }

  private static findMarkdownFiles(dir: string, recursive: boolean): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory() && recursive) {
          files.push(...this.findMarkdownFiles(fullPath, true));
        } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
          files.push(fullPath);
        }
      }
    } catch (err) {
      const error = err as Error;
      output(`[error] Cannot read directory ${dir}: ${error.message}`);
    }

    return files;
  }

  private static extractBasicMetadata(content: string, filename: string): YamlMetadata {
    const h1Match = content.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : filename.replace(/\.md$/, "");

    return {
      title,
      date: new Date().toISOString().split("T")[0],
      source: "",
      summary: "",
      tags: [],
    };
  }
}
