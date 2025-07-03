const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 3000;  // 환경변수 PORT 우선 사용

const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.static('public'));  // 프론트 배포

// 중계 API
app.get('/api/arrival/:station', async (req, res) => {
    const station = req.params.station;

    try {
        const response = await fetch(`http://swopenapi.seoul.go.kr/api/subway/${API_KEY}/json/realtimeStationArrival/0/20/${encodeURIComponent(station)}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('API 호출 실패:', error);
        res.status(500).json({ error: 'API 호출 오류' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행중: http://localhost:${PORT}`);
});
