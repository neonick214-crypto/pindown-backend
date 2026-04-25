const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

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

// Helper: Resolve pin.it short link (multiple methods)
async function resolveShortLink(shortUrl) {
    // Method 1: oEmbed
    try {
        const oembedUrl = `https://www.pinterest.com/oembed?url=${encodeURIComponent(shortUrl)}`;
        const { data } = await axios.get(oembedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PinDown/1.0)' },
            timeout: 8000
        });
        if (data && data.url) return data.url;
    } catch (e) {
        console.log('oEmbed failed, trying redirect...');
    }

    // Method 2: HTTP redirect
    try {
        const response = await axios.get(shortUrl, {
            maxRedirects: 5,
            validateStatus: status => status >= 200 && status < 400,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 8000
        });
        const finalUrl = response.request.res.responseUrl || response.request._redirectable._currentUrl;
        if (finalUrl && finalUrl.includes('pinterest.com/pin/')) return finalUrl;
    } catch (e) {
        console.log('Redirect method failed:', e.message);
    }

    // Method 3: Try appending https:// if missing
    if (!shortUrl.startsWith('http')) {
        return resolveShortLink('https://' + shortUrl);
    }

    throw new Error('Could not resolve short link.');
}

// Helper: Extract video from full Pinterest page
async function extractVideoFromPage(pageUrl) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    const { data } = await axios.get(pageUrl, { headers });
    const $ = cheerio.load(data);

    // Method 1: JSON-LD
    const jsonLd = $('script[type="application/ld+json"]').html();
    if (jsonLd) {
        try {
            const parsed = JSON.parse(jsonLd);
            if (parsed.contentUrl) {
                return {
                    video_url: parsed.contentUrl,
                    thumbnail: parsed.thumbnailUrl || '',
                    title: parsed.name || 'Pinterest Video'
                };
            }
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
            title: $('meta[property="og:title"]').attr('content') || 'Pinterest Video'
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

    throw new Error('No video found on this pin.');
}

// Main Route
app.get('/download', async (req, res) => {
    const pinUrl = req.query.url;
    if (!pinUrl) return res.status(400).json({ error: 'Missing ?url=' });

    try {
        let finalUrl = pinUrl;
        if (pinUrl.includes('pin.it') || pinUrl.includes('pinterest.com/pin/') === false) {
            finalUrl = await resolveShortLink(pinUrl);
        }
        const videoData = await extractVideoFromPage(finalUrl);
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
