// این Netlify Function اطلاعات ترندینگ را شبیه‌سازی می‌کند.
// در یک سناریوی واقعی، اینجا به یک API واقعی (مثلاً یک سرویس اسکرپینگ گوگل ترندز) متصل می‌شدیم.

exports.handler = async function(event, context) {
  // بررسی کنید که درخواست از نوع GET باشد
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed - فقط درخواست GET پشتیبانی می‌شود.",
    };
  }

  try {
    // داده‌های ترندینگ شبیه‌سازی شده
    const trendingTopics = [
      { topic: "هوش مصنوعی", description: "آخرین پیشرفت‌ها در AI و کاربردهای آن.", date: new Date().toISOString() },
      { topic: "تغییرات اقلیمی", description: "اخبار و تحلیل‌های جدید درباره بحران اقلیمی.", date: new Date(Date.now() - 86400000).toISOString() }, // دیروز
      { topic: "اقتصاد جهانی", description: "نوسانات بازارهای مالی و پیش‌بینی‌های اقتصادی.", date: new Date(Date.now() - 2 * 86400000).toISOString() }, // دو روز پیش
      { topic: "فناوری‌های نوین", description: "رونمایی از گجت‌ها و نوآوری‌های تازه.", date: new Date(Date.now() - 3 * 86400000).toISOString() },
      { topic: "سلامت و تندرستی", description: "جدیدترین یافته‌ها در علوم پزشکی و سبک زندگی سالم.", date: new Date(Date.now() - 4 * 86400000).toISOString() },
    ];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trends: trendingTopics }),
    };
  } catch (error) {
    console.error("Error in get-trending-topics function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch trending topics.", details: error.message }),
    };
  }
};
