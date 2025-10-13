#!/usr/bin/env node

/**
 * ProCheff Claude Auto Script
 * Non-interactive Claude API kullanımı
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
});

const runClaudePrompt = async (prompt, context = {}) => {
  try {
    const systemPrompt = `
Sen ProCheff projesinin yardımcı baş mühendisisin (staff+). 
Mevcut dizin: ${process.cwd()}
Proje: Next.js + TypeScript + Tailwind + Google Cloud Run
Context: ${JSON.stringify(context, null, 2)}

Komutları otomatik çalıştır, dosyaları doğrudan düzenle.
`;

      const msg = await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ 
          role: "user", 
          content: prompt 
        }],
      });    console.log("🤖 Claude Response:");
    console.log(msg.content[0].text);
    
    return msg.content[0].text;
  } catch (error) {
    console.error("❌ Claude API Error:", error.message);
    return null;
  }
};

// CLI kullanımı
const prompt = process.argv[2];
if (!prompt) {
  console.log(`
📖 Kullanım:
  node scripts/claude-auto.js "ProCheff'te yeni bir component ekle"
  
🔑 Gereklilik:
  export ANTHROPIC_API_KEY="your_api_key"
  
🎯 Örnekler:
  node scripts/claude-auto.js "Landing page'e hero section ekle"
  node scripts/claude-auto.js "Docker build optimize et"
  node scripts/claude-auto.js "GCP deployment hatası çöz"
`);
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY environment variable gerekli");
  process.exit(1);
}

// Context bilgilerini topla
const context = {
  packageJson: JSON.parse(fs.readFileSync("package.json", "utf8")),
  hasDockerfile: fs.existsSync("Dockerfile"),
  hasGitignore: fs.existsSync(".gitignore"),
  files: fs.readdirSync(".").filter(f => !f.startsWith('.')),
};

runClaudePrompt(prompt, context);