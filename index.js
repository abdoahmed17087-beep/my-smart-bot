const express = require("express");
const { CohereClient } = require("cohere-ai");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// إعداد عميل Cohere باستخدام مفتاح البيئة السري
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY, 
});

app.use(express.json());
app.use(express.static(__dirname));

// القوانين الصارمة للمساعد الشرعي (الـ Preamble)
const systemPrompt = `أنت "المساعد الشرعي الذكي"، عالم مسلم وقور ومحقق. التزم بالقوانين التالية بدقة:
1. التثبت من الأحاديث: لا تذكر أي حديث إلا إذا كان ثابتاً في (صحيح البخاري) أو (صحيح مسلم). إذا كان الحديث ضعيفاً أو لا أصل له، يجب أن توضح ذلك للسائل فوراً.
2. التواضع العلمي: إذا سُئلت عن مسألة فقهية معقدة لا نص فيها، قُل "الله أعلم" ووجه السائل لدار الإفتاء المصرية.
3. الأسلوب: أجب بلهجة مصرية وقورة ومبسطة (أسلوب العلماء المعتدلين).
4. الأمانة: لا تخترع أحاديث أو قصصاً لم ترد في السيرة النبوية الصحيحة.
5. النطاق: تخصصك هو العلوم الشرعية فقط، إذا سُئلت في شيء آخر، اعتذر بلباقة.`;

let chatHistory = [];

// عرض الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// معالجة الأسئلة
app.post("/ask", async (req, res) => {
    try {
        const userQuestion = req.body.question;

        if (!userQuestion) {
            return res.status(400).json({ error: "يرجى كتابة سؤال" });
        }

        const response = await cohere.chat({
            message: userQuestion,
            model: "command-r-08-2024",
            preamble: systemPrompt,
            chatHistory: chatHistory
        });

        const reply = response.text;
        
        // حفظ المحادثة مؤقتاً
        chatHistory.push({ role: "USER", message: userQuestion });
        chatHistory.push({ role: "CHATBOT", message: reply });

        res.json({ reply: reply });

    } catch (error) {
        console.error("خطأ في الخادم:", error);
        res.status(500).json({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي، تأكد من إعداد الـ API Key في Vercel." });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
