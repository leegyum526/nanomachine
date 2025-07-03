let trainNo = '';
let direction = '';
let subwayId = '';
let checkInterval = null;

// 🚇 역과 노선 매핑
const stationLineMap = {
  '구리': ['1063', '1008'],  // 경의중앙선, 8호선
  '도농': ['1063'],
  '다산': ['1008'],
  '석촌': ['1008'],
  '암사': ['1008'],
  '암사역사공원': ['1008'],
  '별내': ['1008'],
  '동구릉': ['1008'],
  '장자호수공원': ['1008'],
  '천호(풍납토성)': ['1008'],
  '강동구청': ['1008'],
  '몽촌토성(평화의문)': ['1008'],
  '잠실': ['1008'],
  '송파': ['1008'],
  '가락시장': ['1008'],
  '문정': ['1008'],
  '장지': ['1008'],
  '복정': ['1008'],
  '남위례': ['1008'],
  '산성': ['1008'],
  '남한산성입구(성남법원,검찰청)': ['1008'],
  '단대오거리': ['1008'],
  '신흥': ['1008'],
  '수진': ['1008'],
  '모란': ['1008'],
  '용산': ['1063'],
  '이촌': ['1063'],
  '서빙고': ['1063'],
  '한남': ['1063'],
  '옥수': ['1063'],
  '응봉': ['1063'],
  '왕십리': ['1063'],
  '청량리': ['1063'],
  '회기': ['1063'],
  '중랑': ['1063'],
  '상봉': ['1063'],
  '망우': ['1063'],
  '양원': ['1063'],
  '덕소': ['1063'],
  '양정': ['1063'],
  '도심': ['1063'],
  '팔당': ['1063'],
  '운길산': ['1063'],
  '양수': ['1063'],
  '신원': ['1063'],
  '국수': ['1063'],
  '아신': ['1063'],
  '오빈': ['1063'],
  '양평': ['1063'],
  '원덕': ['1063'],
  '용문': ['1063'],
  '지평': ['1063'],
  '공덕': ['1063'],
  '서강대': ['1063'],
  '홍대입구': ['1063'],
  '가좌': ['1063'],
  '디지털미디어시티': ['1063'],
  '수색': ['1063'],
  '한국항공대': ['1063'],
  '강매': ['1063'],
  '행신': ['1063'],
  '능곡': ['1063'],
  '대곡': ['1063'],
  '곡산': ['1063'],
  '백마': ['1063'],
  '풍산': ['1063'],
  '일산': ['1063'],
  '탄현': ['1063'],
  '야당': ['1063'],
  '운정': ['1063'],
  '금릉': ['1063'],
  '금촌': ['1063'],
  '월롱': ['1063'],
  '파주': ['1063'],
  '문산': ['1063'],
  '운천': ['1063'],
  '임진강': ['1063'],
  '효창공원앞': ['1063'],
  '신촌(경의중앙선)': ['1063'],
  '서울': ['1063']
};

// 🚇 8호선 역 순서
const line8 = [
  '별내',
  '다산',
  '동구릉',
  '구리',
  '장자호수공원',
  '암사역사공원',
  '암사',
  '천호(풍납토성)',
  '강동구청',
  '몽촌토성(평화의문)',
  '잠실',
  '석촌',
  '송파',
  '가락시장',
  '문정',
  '장지',
  '복정',
  '남위례',
  '산성',
  '남한산성입구(성남법원,검찰청)',
  '단대오거리',
  '신흥',
  '수진',
  '모란'
];

// 🚇 경의중앙선 역 순서
const gyeonguiLine = [
  '문산',
  '운천',
  '임진강',
  '파주',
  '월롱',
  '금촌',
  '금릉',
  '운정',
  '야당',
  '탄현',
  '일산',
  '풍산',
  '백마',
  '곡산',
  '대곡',
  '능곡',
  '행신',
  '강매',
  '한국항공대',
  '수색',
  '디지털미디어시티',
  '가좌',
  '홍대입구',
  '서강대',
  '공덕',
  '서울',
  '신촌(경의중앙선)',
  '효창공원앞',
  '용산',
  '이촌',
  '서빙고',
  '한남',
  '옥수',
  '응봉',
  '왕십리',
  '청량리',
  '회기',
  '중랑',
  '상봉',
  '망우',
  '양원',
  '구리',
  '도농',
  '양정',
  '덕소',
  '도심',
  '팔당',
  '운길산',
  '양수',
  '신원',
  '국수',
  '아신',
  '오빈',
  '양평',
  '원덕',
  '용문',
  '지평'
];


const lineOrderMap = {
  '1063': gyeonguiLine,
  '1008': line8,
};

// 🚇 방향 구하는 함수
function getDirection(lineId, start, end) {
  const order = lineOrderMap[lineId];
  if (!order) return null;
  const startIdx = order.indexOf(start);
  const endIdx = order.indexOf(end);
  if (startIdx === -1 || endIdx === -1) return null;
  return startIdx < endIdx ? '하행' : '상행';
}

// 🚇 탑승 버튼 클릭 이벤트
document.getElementById('rideBtn').addEventListener('click', () => {
  const startStation = document.getElementById('startStation').value.trim();
  const endStation = document.getElementById('endStation').value.trim();

  if (!startStation || !endStation) {
    return alert('출발역과 도착역을 모두 입력하세요.');
  }

  const possibleLines = stationLineMap[startStation]?.filter(line =>
    stationLineMap[endStation]?.includes(line)
  );

  if (!possibleLines || possibleLines.length === 0) {
    return alert('출발역과 도착역이 같은 노선에 있어야 합니다.');
  }

  fetch(`/api/arrival/${startStation}`)
    .then(res => res.json())
    .then(data => {
      const rows = data.realtimeArrivalList || [];

      const targetTrain = rows.find(r =>
        r.statnNm.trim().toLowerCase() === startStation.toLowerCase() &&
        (
          r.arvlMsg2.trim() === `${startStation} 진입` ||
          r.arvlMsg2.trim() === `${startStation} 도착` ||
          r.arvlMsg2.trim() === `${startStation} 출발`
        ) &&
        possibleLines.includes(r.subwayId)
      );

      if (targetTrain) {
        trainNo = targetTrain.btrainNo;
        subwayId = targetTrain.subwayId;
        direction = getDirection(subwayId, startStation, endStation);

        if (!direction) {
          return alert('방향을 확인할 수 없습니다.');
        }

        document.getElementById('status').innerText = `탑승 완료! 열차번호: ${trainNo}, 노선: ${subwayId}, 방향: ${direction}`;
        startMonitoring(endStation);
      } else {
        alert('현재 열차가 출발역에 도착하지 않았습니다. 열차 도착 후 다시 시도하세요.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('API 호출 오류');
    });
});

// 🚇 목적역 모니터링
function startMonitoring(endStation) {
  if (checkInterval) clearInterval(checkInterval);

  checkInterval = setInterval(() => {
    fetch(`/api/arrival/${endStation}`)
      .then(res => res.json())
      .then(data => {
        const rows = data.realtimeArrivalList || [];

        const filtered = rows.filter(r =>
          r.btrainNo === trainNo &&
          r.updnLine === direction &&
          r.subwayId === subwayId
        );

        filtered.forEach(r => {
          const msg = r.arvlMsg2.trim();
          if (
            msg === `${endStation} 도착` ||
            msg === `${endStation} 진입` ||
            msg === `${endStation} 출발`
          ) {
            triggerAlert();
            clearInterval(checkInterval);
          }
        });
      })
      .catch(err => console.error(err));
  }, 30000);
}

// 🚇 알림 트리거
function triggerAlert() {
  document.getElementById('status').innerText = '곧 목적지 도착! 하차 준비하세요!';
  if (window.navigator.vibrate) window.navigator.vibrate(1000);

  if (Notification.permission === 'granted') {
    new Notification('지하철 도착 알림', { body: '목적지에 도착했습니다. 하차 준비하세요!' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('지하철 도착 알림', { body: '목적지에 도착했습니다. 하차 준비하세요!' });
      }
    });
  }
  alert('목적지에 도착했습니다! 하차 준비하세요!');
}
