const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Resolve short link to full URL
async function resolveShortLink(shortUrl) {
    // oEmbed
    try {
        const oembedUrl = `https://www.pinterest.com/oembed?url=${encodeURIComponent(shortUrl)}`;
        const { data } = await axios.get(oembedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PinDown/1.0)' },
            timeout: 8000
        });
        if (data && data.url) return data.url;
    } catch (e) {}
    // HTTP redirect
    try {
        const response = await axios.get(shortUrl, {
            maxRedirects: 5,
            validateStatus: status => status >= 200 && status < 400,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 8000
        });
        const finalUrl = response.request.res.responseUrl;
        if (finalUrl && finalUrl.includes('pinterest.com/pin/')) return finalUrl;
    } catch (e) {}
    throw new Error('Could not resolve short link.');
}

// Extract Pin ID from URL
function extractPinId(url) {
    const match = url.match(/pin\/(\d+)/);
    return match ? match[1] : null;
}

// Get video from Pinterest Public API
async function getVideoFromPinId(pinId) {
    const apiUrl = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_id=${pinId}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
    };
    const { data } = await axios.get(apiUrl, { headers });
    if (data && data.status === 'success' && data.data) {
        const pinData = data.data;
        if (pinData.videos && pinData.videos.video_list) {
            const videos = pinData.videos.video_list;
            const qualityOrder = ['V_H264_1080P', 'V_H264_720P', 'V_H264_480P', 'V_H264_360P'];
            for (const q of qualityOrder) {
                if (videos[q]) {
                    return {
                        video_url: videos[q].url,
                        thumbnail: pinData.image?.original?.url || '',
                        title: pinData.description || pinData.title || 'Pinterest Video'
                    };
                }
            }
            const firstKey = Object.keys(videos)[0];
            if (firstKey) return {
                video_url: videos[firstKey].url,
                thumbnail: pinData.image?.original?.url || '',
                title: pinData.description || pinData.title || 'Pinterest Video'
            };
        }
        throw new Error('This pin does not contain a video.');
    }
    throw new Error('Failed to fetch pin data from Pinterest API.');
}

// Main Route
app.get('/download', async (req, res) => {
    const pinUrl = req.query.url;
    if (!pinUrl) return res.status(400).json({ error: 'Missing ?url=' });
    try {
        let finalUrl = pinUrl;
        if (pinUrl.includes('pin.it')) {
            finalUrl = await resolveShortLink(pinUrl);
        }
        const pinId = extractPinId(finalUrl);
        if (!pinId) throw new Error('Could not extract pin ID.');
        const videoData = await getVideoFromPinId(pinId);
        res.json({ status: 'success', ...videoData });
    } catch (err) {
        console.error('Extraction error:', err.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to extract video. ' + err.message
        });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
