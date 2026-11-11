import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface LoadedPrompt {
  promptId: string;
  promptVersion: string;
  systemTemplate: string;
  userTemplate: string;
}

export interface RenderedPrompt {
  promptId: string;
  promptVersion: string;
  nonce: string;
  system: string;
  user: string;
}

const promptCache = new Map<string, LoadedPrompt>();

/**
 * Loads a versioned prompt from the /prompts directory.
 * Prompts are divided into ## SYSTEM and ## USER sections.
 * Computes an 8-character sha256 version hash from the file content.
 */
export function loadPrompt(promptId: string): LoadedPrompt {
  const cached = promptCache.get(promptId);
  if (cached) return cached;

  const promptDir = path.resolve(process.cwd(), "prompts");
  // Supports both "grader_a" (resolving to grader_a.v1.md) or full "grader_a.v1"
  let fileName = `${promptId}.md`;
  if (!fs.existsSync(path.join(promptDir, fileName))) {
    fileName = `${promptId}.v1.md`;
  }

  const filePath = path.join(promptDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const hash = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 8);
  const promptVersion = `${path.basename(fileName, ".md")}@${hash}`;

  let systemTemplate = "";
  let userTemplate = "";

  const systemIdx = raw.indexOf("## SYSTEM");
  const userIdx = raw.indexOf("## USER");

  if (systemIdx !== -1 && userIdx !== -1) {
    if (systemIdx < userIdx) {
      systemTemplate = raw.slice(systemIdx + "## SYSTEM".length, userIdx).trim();
      userTemplate = raw.slice(userIdx + "## USER".length).trim();
    } else {
      userTemplate = raw.slice(userIdx + "## USER".length, systemIdx).trim();
      systemTemplate = raw.slice(systemIdx + "## SYSTEM".length).trim();
    }
  } else if (systemIdx !== -1) {
    systemTemplate = raw.slice(systemIdx + "## SYSTEM".length).trim();
  } else {
    userTemplate = raw.trim();
  }

  const loaded: LoadedPrompt = {
    promptId,
    promptVersion,
    systemTemplate,
    userTemplate,
  };

  promptCache.set(promptId, loaded);
  return loaded;
}

/**
 * Fills {{VARIABLE}} placeholders in a prompt template.
 */
export function fillPlaceholders(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(pattern, value);
  }
  return result;
}

/**
 * Renders a prompt with a unique random nonce and given placeholders.
 */
export function renderPrompt(
  promptId: string,
  variables: Record<string, string> = {},
  explicitNonce?: string
): RenderedPrompt {
  const loaded = loadPrompt(promptId);
  const nonce = explicitNonce ?? crypto.randomBytes(6).toString("hex");

  const allVars = {
    ...variables,
    NONCE: nonce,
  };

  return {
    promptId,
    promptVersion: loaded.promptVersion,
    nonce,
    system: fillPlaceholders(loaded.systemTemplate, allVars),
    user: fillPlaceholders(loaded.userTemplate, allVars),
  };
}
