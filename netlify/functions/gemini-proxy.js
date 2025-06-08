// این کد یک Netlify Function است که به عنوان پروکسی عمومی برای Gemini API عمل می‌کند.
// این تابع هم برای خلاصه‌سازی و هم برای سایر درخواست‌های هوش مصنوعی از سمت فرانت‌اند استفاده می‌شود.

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in Netlify environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key is not configured." }),
      };
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const { prompt, imageBase64 } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required." }),
      };
    }

    const parts = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/png", // فرض می‌کنیم که تصاویر همیشه PNG هستند
          data: imageBase64,
        },
      });
    }

    const result = await model.generateContent({ contents: [{ role: "user", parts: parts }] });
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response: text }), // تغییر نام 'summary' به 'response' برای عمومی‌تر شدن
    };
  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process AI request.", details: error.message }),
    };
  }
};
