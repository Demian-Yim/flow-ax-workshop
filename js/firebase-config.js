/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Workshop Platform — Firebase Configuration
   ═══════════════════════════════════════════════════════════ */

// Firebase SDK (CDN)
// 실제 Firebase 프로젝트 생성 후 config 값을 업데이트합니다

const firebaseConfig = {
  apiKey: "AIzaSyC5OsAVAQA2oqaam9Eqzbb1nSTUBf69Ui8",
  authDomain: "flow-link-960e9.firebaseapp.com",
  projectId: "flow-link-960e9",
  storageBucket: "flow-link-960e9.firebasestorage.app",
  messagingSenderId: "471192002766",
  appId: "1:471192002766:web:0a221bbb68a5ef2c14f09f"
};

// Firebase 초기화
let app, db, auth;

function initFirebase() {
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log('✅ Firebase 초기화 완료');
    return true;
  } else {
    console.warn('⚠️ Firebase SDK가 로드되지 않았습니다. 오프라인 모드로 동작합니다.');
    return false;
  }
}

// ── Firestore Helper Functions ──

// 워크샵(클래스) 생성
async function createWorkshop(data) {
  try {
    const code = generateClassCode();
    const workshop = {
      name: data.name,
      type: data.type, // 'hackathon' | 'vibe-coding' | 'ax-redesign'
      code: code,
      rounds: data.rounds || getDefaultRounds(data.type),
      currentRound: 1,
      status: 'active',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      teams: [],
      settings: {
        maxTeamSize: data.maxTeamSize || 5,
        allowLateJoin: true,
      }
    };
    const ref = await db.collection('workshops').add(workshop);
    return { id: ref.id, ...workshop };
  } catch (err) {
    console.error('워크샵 생성 실패:', err);
    throw err;
  }
}

// 워크샵 코드로 조회
async function getWorkshopByCode(code) {
  try {
    const snapshot = await db.collection('workshops')
      .where('code', '==', code.toUpperCase())
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error('워크샵 조회 실패:', err);
    return null;
  }
}

// 팀 생성
async function createTeam(workshopId, teamData) {
  try {
    const pin = generateTeamPin();
    const team = {
      workshopId,
      name: teamData.name,
      pin: pin,
      members: teamData.members || [],
      currentStep: 1,
      progress: 0,
      submission: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await db.collection('workshops').doc(workshopId)
      .collection('teams').add(team);
    return { id: ref.id, ...team };
  } catch (err) {
    console.error('팀 생성 실패:', err);
    throw err;
  }
}

// 팀 목록 실시간 구독
function subscribeTeams(workshopId, callback) {
  return db.collection('workshops').doc(workshopId)
    .collection('teams')
    .orderBy('createdAt')
    .onSnapshot(snapshot => {
      const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(teams);
    });
}

// 팀 진행도 업데이트
async function updateTeamProgress(workshopId, teamId, data) {
  try {
    await db.collection('workshops').doc(workshopId)
      .collection('teams').doc(teamId)
      .update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (err) {
    console.error('팀 업데이트 실패:', err);
    throw err;
  }
}

// 결과물 제출
async function submitProject(workshopId, teamId, submission) {
  try {
    await db.collection('workshops').doc(workshopId)
      .collection('teams').doc(teamId)
      .update({
        submission: {
          ...submission,
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        progress: 100
      });
  } catch (err) {
    console.error('제출 실패:', err);
    throw err;
  }
}

// 좋아요 투표
async function voteProject(workshopId, teamId) {
  try {
    await db.collection('workshops').doc(workshopId)
      .collection('teams').doc(teamId)
      .update({
        votes: firebase.firestore.FieldValue.increment(1)
      });
  } catch (err) {
    console.error('투표 실패:', err);
    throw err;
  }
}

// ── Utility Functions ──

function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateTeamPin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getDefaultRounds(type) {
  const rounds = {
    'hackathon': [
      { step: 1, name: '이해하기', desc: '문제를 정의하고 사용자를 이해합니다', icon: '🔍', aiTip: 'ChatGPT로 문제 정의 브레인스토밍' },
      { step: 2, name: '스케치하기', desc: '가능한 많은 솔루션을 스케치합니다', icon: '✏️', aiTip: 'DALL-E, Midjourney로 UI 컨셉 생성' },
      { step: 3, name: '결정하기', desc: '최적의 솔루션을 선택합니다', icon: '⚡', aiTip: 'AI로 아이디어 타당성 분석' },
      { step: 4, name: '프로토타입', desc: 'AI와 함께 실제 작동하는 프로토타입을 만듭니다', icon: '🚀', aiTip: 'Cursor, Bolt, AI Studio로 바이브코딩' },
      { step: 5, name: '테스트하기', desc: '결과물을 테스트하고 피드백을 수집합니다', icon: '🧪', aiTip: 'AI로 테스트 시나리오 자동 생성' },
    ],
    'vibe-coding': [
      { step: 1, name: '아이디어', desc: '만들고 싶은 것을 자유롭게 구상합니다', icon: '💡', aiTip: 'ChatGPT에게 아이디어 브레인스토밍 요청' },
      { step: 2, name: '프롬프트', desc: 'AI에게 줄 프롬프트를 설계합니다', icon: '📝', aiTip: '구체적이고 명확한 지시문 작성' },
      { step: 3, name: '빌드', desc: 'AI와 대화하며 앱을 만듭니다', icon: '🔨', aiTip: 'AI Studio, Cursor, Bolt에서 실시간 코딩' },
      { step: 4, name: '공유', desc: '결과물을 배포하고 공유합니다', icon: '🌐', aiTip: 'Vercel, Netlify로 즉시 배포' },
    ],
    'ax-redesign': [
      { step: 1, name: 'AS-IS 분석', desc: '현재 업무 프로세스를 분석합니다', icon: '📊', aiTip: 'AI로 업무 프로세스 맵핑' },
      { step: 2, name: 'AI 매핑', desc: '자동화 가능한 업무를 식별합니다', icon: '🤖', aiTip: 'AI 적용 가능 영역 매트릭스 생성' },
      { step: 3, name: 'TO-BE 설계', desc: 'AI가 통합된 미래 프로세스를 설계합니다', icon: '🎯', aiTip: 'AI 워크플로우 다이어그램 작성' },
      { step: 4, name: '실행 계획', desc: '구체적인 변환 로드맵을 수립합니다', icon: '📋', aiTip: 'AI로 실행 계획서 자동 작성' },
    ],
  };
  return rounds[type] || rounds['hackathon'];
}

// 워크샵 유형별 라벨
function getWorkshopTypeLabel(type) {
  const labels = {
    'hackathon': { emoji: '🤖', label: 'AI 해커톤', color: 'primary' },
    'vibe-coding': { emoji: '🎵', label: '바이브코딩', color: 'secondary' },
    'ax-redesign': { emoji: '🔄', label: 'AX 직무 리디자인', color: 'accent' },
  };
  return labels[type] || labels['hackathon'];
}
