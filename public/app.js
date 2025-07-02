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
  '암사': ['1008']
};

// 🚇 각 노선의 역 순서 정의
const gyeonguiLine = ['문산', '운정', '일산', '덕소', '구리', '도농'];
const line8 = ['구리', '암사', '다산', '별내', '석촌', '암사역사공원'];  // 예시, 실제 역 순서 넣어야 함

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
