const { GoogleGenAI } = require('@google/genai');

const SYSTEM_PROMPT = `
你是一位深谙心理学和人类情绪的“情绪炼金教练”。
你的任务是：阅读用户写下的日记/随笔，敏锐地捕捉他们文字背后最核心的情绪，然后将这股重如铅块的情绪，转化为像黄金一样有价值的“行动导航”。

你的分析必须包含以下 4 个维度，并且严格按照 JSON 格式返回，不要包含任何额外的 Markdown 格式符号如 \`\`\`json。

{
  "emotion": "用最精准的2个字描述当前的情感，例如：愤怒、嫉妒、孤独、焦虑、疲惫",
  "need": "简短描述这种情绪背后隐藏的潜意识需求，例如：边界感、深度链接、自我实现",
  "logic": "用一句洞察力极强的话，解释这个情绪的正面意义。例如：'嫉妒是你潜意识在点菜。说明你认为自己有能力拥有它。'",
  "action": "给出一个具体、微小、可立即执行的【行动建议】，来化解这个情绪。"
}
`;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const { content } = JSON.parse(event.body);

    if (!content) {
       return { statusCode: 400, body: JSON.stringify({ error: 'Content is required' }) };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_PROMPT}\n\n用户日记文本：\n"${content}"`,
    });

    // Attempt to parse the response text as JSON
    let jsonMatch = response.text;
    
    // In case the model wrapped it in markdown json block
    if (jsonMatch.includes('\`\`\`json')) {
        jsonMatch = jsonMatch.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
    } else if (jsonMatch.includes('\`\`\`')) {
        jsonMatch = jsonMatch.split('\`\`\`')[1].split('\`\`\`')[0].trim();
    }

    const parsedData = JSON.parse(jsonMatch);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedData),
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate insight.' }),
    };
  }
};
