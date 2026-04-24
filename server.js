const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/download', (req, res) => {
    res.json({ status: 'success', message: 'Server is working' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
