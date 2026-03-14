import fs from 'fs';
import path from 'path';

export interface GrepMatch {
  file: string;
  line: number;
  content: string;
}

export interface GrepOptions {
  /** Directory/file names to skip (matched against basename) */
  exclude?: string[];
}

const DEFAULT_EXCLUDE = [
  'node_modules',
  '.git',
  'bin',
  'obj',
  'dist',
  'build',
  'target',
  '.gradle',
  '.mvn',
];

/**
 * Recursively search files in a directory for lines matching a regex pattern.
 * Skips binary files and excluded directories/files.
 */
export function grepRecursive(
  dir: string,
  pattern: RegExp,
  opts?: GrepOptions,
): GrepMatch[] {
  const excludeSet = new Set([...DEFAULT_EXCLUDE, ...(opts?.exclude ?? [])]);
  const matches: GrepMatch[] = [];

  function walk(currentDir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (excludeSet.has(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        searchFile(fullPath, pattern, matches);
      }
    }
  }

  walk(dir);
  return matches;
}

function searchFile(
  filePath: string,
  pattern: RegExp,
  matches: GrepMatch[],
): void {
  // Skip binary files by checking first 512 bytes for null bytes
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(512);
    const bytesRead = fs.readSync(fd, buf, 0, 512, 0);
    fs.closeSync(fd);

    if (bytesRead > 0 && buf.subarray(0, bytesRead).includes(0)) {
      return; // binary file
    }
  } catch {
    return;
  }

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return;
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    if (pattern.test(lines[i])) {
      matches.push({
        file: filePath,
        line: i + 1,
        content: lines[i].trim(),
      });
    }
  }
}
