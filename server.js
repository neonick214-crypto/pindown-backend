const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS =====
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ===== Helper: Extract video from Pinterest page =====
async function getPinterestVideo(pageUrl) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };

    const { data } = await axios.get(pageUrl, { headers });
    const $ = cheerio.load(data);

    // Method 1: JSON-LD (often contains contentUrl)
    const jsonLd = $('script[type="application/ld+json"]').html();
    if (jsonLd) {
        try {
            const parsed = JSON.parse(jsonLd);
            if (parsed.contentUrl) return {
                video_url: parsed.contentUrl,
                thumbnail: parsed.thumbnailUrl || '',
                title: parsed.name || 'Pinterest Video'
            };
            // Sometimes array
            if (Array.isArray(parsed) && parsed[0]?.contentUrl) {
                return {
                    video_url: parsed[0].contentUrl,
                    thumbnail: parsed[0].thumbnailUrl || '',
                    title: parsed[0].name || 'Pinterest Video'
                };
            }
        } catch (e) {}
    }

    // Method 2: <video> tag
    const videoEl = $('video');
    if (videoEl.length) {
        const src = videoEl.attr('src') || videoEl.find('source').attr('src');
        const poster = videoEl.attr('poster');
        if (src) return {
            video_url: src,
            thumbnail: poster || '',
            title: 'Pinterest Video'
        };
    }

    // Method 3: og:video meta
    const ogVideo = $('meta[property="og:video"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogVideo) return {
        video_url: ogVideo,
        thumbnail: ogImage || '',
        title: $('meta[property="og:title"]').attr('content') || 'Pinterest Video'
    };

    throw new Error('Could not extract video from the provided Pinterest link.');
}

// ===== Main Download Route =====
app.get('/download', async (req, res) => {
    const pinUrl = req.query.url;
    if (!pinUrl) return res.status(400).json({ error: 'Missing ?url= parameter' });

    try {
        const videoData = await getPinterestVideo(pinUrl);
        res.json({ status: 'success', ...videoData });
    } catch (err) {
        console.error('Extraction error:', err.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to extract video. Please check the link or try again later.'
        });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
