const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const listModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We try to call listModels or make a test generation to inspect supported tags
    console.log("Connecting to Gemini API using key:", apiKey.substring(0, 8) + "...");
    
    // Note: The newer SDK version has different methods, let's verify if listModels works:
    // Some versions don't expose listModels on the class directly, or require Vertex/API client.
    // Let's also check if generating with 'gemini-1.5-flash-latest' or 'gemini-2.0-flash-exp' or 'gemini-1.5-pro' succeeds.
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash',
      'gemini-3.5-flash'
    ];

    for (const m of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("hello");
        console.log(`✅ Model '${m}' is ACTIVE and responded:`, result.response.text().trim());
      } catch (err) {
        console.log(`❌ Model '${m}' failed:`, err.message);
      }
    }
  } catch (error) {
    console.error("Failed to execute model list:", error.message);
  }
};

listModels();
