const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS ခွင့်ပြုချက်များ =====
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // OPTIONS request အတွက် 200 OK ပြန်ပေး
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===== Download Route =====
app.get('/download', (req, res) => {
    // ဒီနေရာမှာ Pinterest Video Link ကို ကိုင်တွယ်ပြီး တကယ့် Video URL ကို ပြန်ပေးဖို့ လိုပါမယ်
    res.json({ 
        status: 'success', 
        message: 'Server is working with CORS enabled!',
        video_url: 'https://via.placeholder.com/video.mp4', 
        thumbnail: 'https://via.placeholder.com/300.jpg',
        title: 'Sample Video'
    });
});

// ===== Server Start =====
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
