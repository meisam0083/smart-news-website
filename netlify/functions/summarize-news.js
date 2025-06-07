// این کد یک Netlify Function است که به عنوان بک‌اند (Backend) برای خلاصه‌سازی اخبار عمل می‌کند.
// این Function کلید API Gemini را به صورت امن مدیریت می‌کند و از سمت سرور فراخوانی می‌شود.

// وارد کردن کتابخانه Google Generative AI Node.js (که توسط Netlify فراهم می‌شود)
const { GoogleGenerativeAI } = require("@google/generative-ai");

// تابع اصلی Netlify Function که هنگام فراخوانی اجرا می‌شود.
exports.handler = async function(event, context) {
  // اطمینان از اینکه درخواست به صورت POST و شامل بدنه (body) است.
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // کد وضعیت 405 به معنی "Method Not Allowed" است.
      body: "Method Not Allowed",
    };
  }

  try {
    // گرفتن کلید API Gemini از متغیرهای محیطی Netlify (امن).
    // این کلید نباید مستقیماً در کد فرانت‌اند (index.html) باشد.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // بررسی اینکه کلید API وجود دارد.
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in Netlify environment variables.");
      return {
        statusCode: 500, // کد وضعیت 500 به معنی "Internal Server Error" است.
        body: JSON.stringify({ error: "API key is not configured." }),
      };
    }

    // مقداردهی اولیه مدل Gemini با استفاده از کلید API.
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // انتخاب مدل gemini-2.0-flash برای تولید محتوا.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // تجزیه (parse) بدنه درخواست ورودی (که شامل متن مقاله است).
    const { articleContent } = JSON.parse(event.body);

    // ساخت دستور (prompt) برای خلاصه‌سازی به زبان فارسی.
    const prompt = `متن زیر را به فارسی و به صورت خلاصه (حداکثر 5 خط) برای یک خبرنامه مختصر و مفید بازنویسی کن. فقط متن خلاصه را ارائه بده و از هیچ مقدمه یا موخره ای استفاده نکن:\n\n${articleContent}`;

    // ارسال درخواست به مدل Gemini برای تولید محتوا.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // گرفتن متن خلاصه‌شده.

    // بازگرداندن پاسخ موفقیت‌آمیز (200 OK) همراه با متن خلاصه‌شده.
    return {
      statusCode: 200, // کد وضعیت 200 به معنی "OK" است.
      headers: {
        "Content-Type": "application/json", // تنظیم نوع محتوا به JSON.
      },
      body: JSON.stringify({ summary: text }), // ارسال خلاصه در قالب JSON.
    };
  } catch (error) {
    // گرفتن و ثبت هر خطایی که در طول اجرای Function رخ می‌دهد.
    console.error("Error in Netlify function:", error);
    // بازگرداندن پاسخ خطای سرور (500 Internal Server Error) همراه با جزئیات خطا.
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to summarize article.", details: error.message }),
    };
  }
};
