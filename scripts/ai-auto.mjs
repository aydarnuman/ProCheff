#!/usr/bin/env node

/**
 * ProCheff Multi-AI Auto Script
 * Claude + OpenAI desteği
 */

const runAIPrompt = async (prompt, provider = 'claude', context = {}) => {
  try {
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      // OpenAI implementation
      const { Configuration, OpenAIApi } = await import('openai');
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);
      
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: `Sen ProCheff projesinin yardımcı baş mühendisisin. Context: ${JSON.stringify(context, null, 2)}`
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000
      });
      
      console.log("🤖 OpenAI GPT-4 Response:");
      console.log(completion.data.choices[0].message.content);
      return completion.data.choices[0].message.content;
      
    } else if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
      // Claude implementation (mevcut kod)
      const Anthropic = await import("@anthropic-ai/sdk");
      const client = new Anthropic.default({ 
        apiKey: process.env.ANTHROPIC_API_KEY 
      });
      
      const msg = await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: `Sen ProCheff projesinin yardımcı baş mühendisisin. Context: ${JSON.stringify(context, null, 2)}`,
        messages: [{ role: "user", content: prompt }],
      });
      
      console.log("🤖 Claude Response:");
      console.log(msg.content[0].text);
      return msg.content[0].text;
      
    } else {
      throw new Error(`${provider} için API key bulunamadı`);
    }
    
  } catch (error) {
    console.error(`❌ ${provider} API Error:`, error.message);
    
    // Fallback to other provider
    if (provider === 'claude' && process.env.OPENAI_API_KEY) {
      console.log("🔄 Claude failed, trying OpenAI...");
      return runAIPrompt(prompt, 'openai', context);
    } else if (provider === 'openai' && process.env.ANTHROPIC_API_KEY) {
      console.log("🔄 OpenAI failed, trying Claude...");
      return runAIPrompt(prompt, 'claude', context);
    }
    
    return null;
  }
};

// CLI handling
const provider = process.env.AI_PROVIDER || 'claude';
const prompt = process.argv[2];

if (!prompt) {
  console.log(`
📖 Kullanım:
  npm run ai "ProCheff'e component ekle"
  AI_PROVIDER=openai npm run ai "Landing page düzenle"
  
🔑 Gereklilik:
  export ANTHROPIC_API_KEY="sk-ant-..."  # Claude için
  export OPENAI_API_KEY="sk-..."         # OpenAI için
  
🎯 Provider Seçimi:
  AI_PROVIDER=claude (default)
  AI_PROVIDER=openai
`);
  process.exit(1);
}

// Auto-detect available provider
let activeProvider = provider;
if (!process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY) {
  activeProvider = 'openai';
} else if (!process.env.OPENAI_API_KEY && process.env.ANTHROPIC_API_KEY) {
  activeProvider = 'claude';
}

if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY veya OPENAI_API_KEY gerekli");
  process.exit(1);
}

// Context collection
import fs from 'fs';
const context = {
  packageJson: JSON.parse(fs.readFileSync("package.json", "utf8")),
  hasDockerfile: fs.existsSync("Dockerfile"),
  activeProvider: activeProvider,
  availableProviders: {
    claude: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY
  }
};

console.log(`🔧 Using ${activeProvider.toUpperCase()} provider`);
runAIPrompt(prompt, activeProvider, context);