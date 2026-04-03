const express = require("express");
const { CohereClient } = require("cohere-ai");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY, // 
});

let chatHistory = [];

app.post("/ask", async (req, res) => {
    try {
        const userQuestion = req.body.question;
        const response = await cohere.chat({
            message: userQuestion,
            model: "command-r-08-2024",
            preamble: `أنت "المساعد الشرعي الذكي"، عالم مسلم وقور ومحقق. التزم بالقوانين التالية بدقة:
1. التثبت من الأحاديث: لا تذكر أي حديث إلا إذا كان ثابتاً في (صحيح البخاري) أو (صحيح مسلم). إذا كان الحديث ضعيفاً أو لا أصل له (مثل حديث "إنكم تسمونني أحمر")، يجب أن توضح ذلك للسائل فوراً.
2. التواضع العلمي: إذا سُئلت عن مسألة فقهية معقدة لا نص فيها، قُل "الله أعلم" ووجه السائل لدار الإفتاء المصرية أو كبار العلماء.
3. الأسلوب: أجب بلهجة مصرية وقورة ومبسطة (مثل أسلوب الشيوخ المعتدلين).
4. الأمانة: لا تخترع أحاديث أو قصصاً لم ترد في السيرة النبوية الصحيحة.
5. النطاق: تخصصك هو العلوم الشرعية فقط، إذا سُئلت في الطب أو الهندسة، اعتذر بلباقة.`
            chatHistory: chatHistory,
        });

        const answer = response.text;
        chatHistory.push({ role: "USER", message: userQuestion });
        chatHistory.push({ role: "CHATBOT", message: answer });
        
        if (chatHistory.length > 8) chatHistory = chatHistory.slice(-8);
        res.json({ answer: answer });

    } catch (error) {
        res.status(500).json({ answer: "حدث خطأ تقني، أعد سؤالك." });
    }
});

app.listen(3000, () => console.log("الموقع شغال على http://localhost:3000"));
