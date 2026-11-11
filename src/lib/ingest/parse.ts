import "server-only";
import mammoth from "mammoth";
import JSZip from "jszip";
import { extractText } from "unpdf";

export interface ParsedDocument {
  text: string;
  hiddenRuns: { text: string; reason: "vanish" | "white" | "tiny" }[];
  warnings: string[];
}

/**
 * Parses TXT, DOCX, and PDF buffers into plain text and style-based hidden text runs.
 */
export async function parseDocument(
  fileName: string,
  buffer: Buffer
): Promise<ParsedDocument> {
  const ext = fileName.toLowerCase().split(".").pop();
  const warnings: string[] = [];
  const hiddenRuns: { text: string; reason: "vanish" | "white" | "tiny" }[] = [];

  if (ext === "txt") {
    const text = buffer.toString("utf-8");
    return { text, hiddenRuns, warnings };
  }

  if (ext === "docx") {
    // 1. Extract plain text via mammoth
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || "";
    if (result.messages && result.messages.length > 0) {
      warnings.push(...result.messages.map((m) => m.message));
    }

    // 2. Inspect word/document.xml via JSZip for hidden runs (white text, vanish tag, tiny font)
    try {
      const zip = await JSZip.loadAsync(buffer);
      const docXmlFile = zip.file("word/document.xml");
      if (docXmlFile) {
        const docXml = await docXmlFile.async("string");
        // Scan w:r (runs) in XML
        const runRegex = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
        let match;
        while ((match = runRegex.exec(docXml)) !== null) {
          const runContent = match[1];
          const textMatch = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
          let runText = "";
          let tMatch;
          while ((tMatch = textMatch.exec(runContent)) !== null) {
            runText += tMatch[1];
          }

          if (runText.trim()) {
            // Check for vanish
            if (runContent.includes("<w:vanish") || runContent.includes("<w:hidden")) {
              hiddenRuns.push({ text: runText, reason: "vanish" });
            }
            // Check for white/near-white color: FFFFFF, FEFEFE, FDFDFD
            else if (/<w:color\s+[^>]*w:val="(?:FFFFFF|FEFEFE|FDFDFD|FAFAFA)"/i.test(runContent)) {
              hiddenRuns.push({ text: runText, reason: "white" });
            }
            // Check for tiny font size (under 4 half-points = 2pt)
            else {
              const szMatch = /<w:sz\s+[^>]*w:val="(\d+)"/i.exec(runContent);
              if (szMatch && parseInt(szMatch[1], 10) < 4) {
                hiddenRuns.push({ text: runText, reason: "tiny" });
              }
            }
          }
        }
      }
    } catch (zipErr) {
      warnings.push(`Could not inspect DOCX XML metadata: ${zipErr}`);
    }

    return { text, hiddenRuns, warnings };
  }

  if (ext === "pdf") {
    try {
      const uint8 = new Uint8Array(buffer);
      const pdf = await extractText(uint8);
      const text = Array.isArray(pdf.text) ? pdf.text.join("\n") : String(pdf.text || "");
      return { text, hiddenRuns, warnings };
    } catch (pdfErr) {
      warnings.push(`PDF parsing error: ${pdfErr}`);
      return { text: "", hiddenRuns, warnings };
    }
  }

  throw new Error(`Unsupported file type: .${ext} (supported: .txt, .docx, .pdf)`);
}
