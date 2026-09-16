/**
 * 초등학교 5학년 관심사 데이터 수집 및 엑셀 다운로드 (엔트리 연동)
 * 메인 애플리케이션 로직
 */

// ------------------------------------------------------------------
// 1. Firebase Firestore 연동 설정
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDo6A9CRBu5l7zpFpMyNM6YJB4f-BSif1c",
  authDomain: "entry-data-422e6.firebaseapp.com",
  projectId: "entry-data-422e6",
  storageBucket: "entry-data-422e6.firebasestorage.app",
  messagingSenderId: "345763157045",
  appId: "1:345763157045:web:a778bdb50d1088d24d0d7c",
  measurementId: "G-RHY5C91EP4"
};


let db = null;
if (typeof firebase !== 'undefined' && firebase.initializeApp) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  } catch (e) {
    console.warn("Firebase 초기화 경고: 로컬 모드로 동작합니다.", e);
  }
}

const COLLECTION_NAME = "entry_data_students"; // Firestore 실시간 컬렉션명
const LOCAL_STORAGE_KEY = "entry_data_students_v2";
const TEACHER_PASSWORD = "0815"; // 선생님 모드 접속 비밀번호


// ------------------------------------------------------------------
// 2. 기본 25명 샘플 데이터 (스크린샷의 1~10번 색깔 완벽 반영)
// ------------------------------------------------------------------
const DEFAULT_SAMPLE_STUDENTS = [
  { num: 1, color: "빨강", subject: "체육", animal: "강아지", food: "치킨", hobby: "축구/운동" },
  { num: 2, color: "파랑", subject: "과학", animal: "고양이", food: "피자", hobby: "게임" },
  { num: 3, color: "초록", subject: "미술", animal: "토끼", food: "떡볶이", hobby: "그림그리기" },
  { num: 4, color: "노랑", subject: "음악", animal: "햄스터", food: "마라탕", hobby: "유튜브 시청" },
  { num: 5, color: "빨강", subject: "체육", animal: "호랑이", food: "치킨", hobby: "게임" },
  { num: 6, color: "노랑", subject: "수학", animal: "강아지", food: "돈가스", hobby: "만들기/블록" },
  { num: 7, color: "초록", subject: "과학", animal: "판다", food: "라면", hobby: "웹툰/독서" },
  { num: 8, color: "노랑", subject: "사회", animal: "고양이", food: "떡볶이", hobby: "친구와 놀기" },
  { num: 9, color: "초록", subject: "미술", animal: "돌고래", food: "탕수육", hobby: "음악/춤" },
  { num: 10, color: "파랑", subject: "실과", animal: "강아지", food: "치킨", hobby: "게임" },
  { num: 11, color: "보라", subject: "국어", animal: "고양이", food: "피자", hobby: "웹툰/독서" },
  { num: 12, color: "분홍", subject: "음악", animal: "토끼", food: "마라탕", hobby: "음악/춤" },
  { num: 13, color: "파랑", subject: "체육", animal: "치타", food: "삼겹살", hobby: "축구/운동" },
  { num: 14, color: "하늘", subject: "영어", animal: "돌고래", food: "초밥", hobby: "유튜브 시청" },
  { num: 15, color: "빨강", subject: "체육", animal: "호랑이", food: "치킨", hobby: "게임" },
  { num: 16, color: "주황", subject: "미술", animal: "토끼", food: "떡볶이", hobby: "그림그리기" },
  { num: 17, color: "초록", subject: "과학", animal: "판다", food: "라면", hobby: "만들기/블록" },
  { num: 18, color: "노랑", subject: "수학", animal: "강아지", food: "피자", hobby: "친구와 놀기" },
  { num: 19, color: "파랑", subject: "실과", animal: "고양이", food: "치킨", hobby: "게임" },
  { num: 20, color: "보라", subject: "음악", animal: "펭귄", food: "마라탕", hobby: "음악/춤" },
  { num: 21, color: "빨강", subject: "체육", animal: "강아지", food: "삼겹살", hobby: "축구/운동" },
  { num: 22, color: "초록", subject: "사회", animal: "곰", food: "라면", hobby: "유튜브 시청" },
  { num: 23, color: "파랑", subject: "과학", animal: "돌고래", food: "돈가스", hobby: "만들기/블록" },
  { num: 24, color: "분홍", subject: "미술", animal: "토끼", food: "마라탕", hobby: "그림그리기" },
  { num: 25, color: "하양", subject: "도덕", animal: "곰", food: "피자", hobby: "친구와 놀기" }
];

// ------------------------------------------------------------------
// 3. 애플리케이션 상태 (State)
// ------------------------------------------------------------------
const state = {
  activeTab: 'student', // 'student' | 'teacher'
  currentTableView: 'total', // 전체 종합 테이블 기본 표시
  students: [],
  selectedForm: {
    num: '',
    color: '',
    subject: '',
    animal: '',
    food: '',
    hobby: ''
  }
};

// ------------------------------------------------------------------
// 4. 초기화
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initQuickNumberButtons();
  initChipButtons();
  initNavigationTabs();
  initFormHandler();
  initTeacherControls();
  initDownloadButtons();
  initEditModal();
  initPasswordModal();
  initDeleteAllModal();
  
  // 데이터 불러오기
  loadStudentsData();
});

// ------------------------------------------------------------------
// 5. 1~30번 출석번호 빠른 버튼 생성 및 이벤트
// ------------------------------------------------------------------
function initQuickNumberButtons() {
  const container = document.getElementById('quickNumberGrid');
  const numInput = document.getElementById('studentNumInput');
  const numStatusText = document.getElementById('numStatusText');

  container.innerHTML = '';
  for (let i = 1; i <= 30; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'num-btn';
    btn.textContent = i;
    btn.dataset.num = i;
    btn.addEventListener('click', () => {
      selectStudentNumber(i);
    });
    container.appendChild(btn);
  }

  numInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      highlightSelectedNumber(val);
      checkExistingSubmission(val);
    } else {
      highlightSelectedNumber(null);
      numStatusText.textContent = '';
    }
  });
}

function selectStudentNumber(num) {
  const numInput = document.getElementById('studentNumInput');
  numInput.value = num;
  state.selectedForm.num = num;
  highlightSelectedNumber(num);
  checkExistingSubmission(num);
}

function highlightSelectedNumber(num) {
  const buttons = document.querySelectorAll('.quick-number-grid .num-btn');
  buttons.forEach(btn => {
    if (parseInt(btn.dataset.num, 10) === num) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

function checkExistingSubmission(num) {
  const numStatusText = document.getElementById('numStatusText');
  const existing = state.students.find(s => s.num === num);
  if (existing) {
    numStatusText.className = 'status-tip submitted';
    numStatusText.innerHTML = `✅ <strong>${num}번</strong> 친구는 이미 제출을 완료했어요! (선택을 바꾸면 새 답변으로 수정돼요)`;
    // 기존 입력값 자동 채우기 안내
    prefillStudentForm(existing);
  } else {
    numStatusText.className = 'status-tip';
    numStatusText.textContent = '';
  }
}

function prefillStudentForm(existing) {
  // 색깔
  if (existing.color) {
    selectChip('color', existing.color);
  }
  // 과목
  if (existing.subject) {
    selectChip('subject', existing.subject);
  }
  // 동물
  if (existing.animal) {
    selectChip('animal', existing.animal);
  }
  // 음식
  if (existing.food) {
    selectChip('food', existing.food);
  }
  // 여가활동
  if (existing.hobby) {
    selectChip('hobby', existing.hobby);
  }
}

// ------------------------------------------------------------------
// 6. 칩 버튼 및 직접 입력 동기화
// ------------------------------------------------------------------
function initChipButtons() {
  const allChips = document.querySelectorAll('.chip-btn');
  allChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const field = chip.dataset.field;
      const val = chip.dataset.val;
      selectChip(field, val);
    });
  });

  // 직접 입력 필드 이벤트
  bindCustomInput('customColorInput', 'color');
  bindCustomInput('customSubjectInput', 'subject');
  bindCustomInput('customAnimalInput', 'animal');
  bindCustomInput('customFoodInput', 'food');
  bindCustomInput('customHobbyInput', 'hobby');
}

function selectChip(field, val) {
  state.selectedForm[field] = val;
  const chips = document.querySelectorAll(`.chip-btn[data-field="${field}"]`);
  let matched = false;

  chips.forEach(chip => {
    if (chip.dataset.val === val) {
      chip.classList.add('selected');
      matched = true;
    } else {
      chip.classList.remove('selected');
    }
  });

  // 직접 입력창 동기화
  const customInputMap = {
    color: 'customColorInput',
    subject: 'customSubjectInput',
    animal: 'customAnimalInput',
    food: 'customFoodInput',
    hobby: 'customHobbyInput'
  };

  const inputEl = document.getElementById(customInputMap[field]);
  if (inputEl) {
    if (!matched && val) {
      inputEl.value = val;
    } else {
      inputEl.value = '';
    }
  }
}

function bindCustomInput(inputId, field) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    if (text) {
      state.selectedForm[field] = text;
      // 기존 선택 칩 해제
      const chips = document.querySelectorAll(`.chip-btn[data-field="${field}"]`);
      chips.forEach(c => c.classList.remove('selected'));
    }
  });
}

// ------------------------------------------------------------------
// 7. 학생 설문 제출 처리 & 완료 화면 표시
// ------------------------------------------------------------------
function initFormHandler() {
  const form = document.getElementById('surveyForm');
  const statusMsg = document.getElementById('formStatusMsg');
  const submitBtn = document.getElementById('submitBtn');

  // 완료 카드 버튼: 답변 수정하기
  const editMyBtn = document.getElementById('editMySubmissionBtn');
  if (editMyBtn) {
    editMyBtn.addEventListener('click', () => {
      document.getElementById('submitSuccessCard').classList.add('hidden');
      form.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // 완료 카드 버튼: 다른 번호(친구) 설문하기
  const newSubBtn = document.getElementById('newSubmissionBtn');
  if (newSubBtn) {
    newSubBtn.addEventListener('click', () => {
      document.getElementById('submitSuccessCard').classList.add('hidden');
      form.classList.remove('hidden');
      resetStudentForm();
      document.getElementById('stepNumber').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const numVal = parseInt(document.getElementById('studentNumInput').value, 10);
    if (isNaN(numVal) || numVal < 1) {
      showStatusMsg(statusMsg, '⚠️ 번호(출석번호)를 입력해주세요!', 'error');
      document.getElementById('stepNumber').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const colorVal = state.selectedForm.color || document.getElementById('customColorInput').value.trim();
    if (!colorVal) {
      showStatusMsg(statusMsg, '🎨 좋아하는 색깔을 골라주세요!', 'error');
      document.getElementById('stepColor').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const subjectVal = state.selectedForm.subject || document.getElementById('customSubjectInput').value.trim() || '미입력';
    const animalVal = state.selectedForm.animal || document.getElementById('customAnimalInput').value.trim() || '미입력';
    const foodVal = state.selectedForm.food || document.getElementById('customFoodInput').value.trim() || '-';
    const hobbyVal = state.selectedForm.hobby || document.getElementById('customHobbyInput').value.trim() || '-';

    const newStudent = {
      num: numVal,
      color: colorVal,
      subject: subjectVal,
      animal: animalVal,
      food: foodVal,
      hobby: hobbyVal,
      timestamp: new Date().toISOString()
    };

    // 제출 버튼 로딩 상태 표시
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ 안전하게 저장하는 중...</span>';
    }

    // 로컬 데이터 목록 업데이트 (중복 번호 수정 또는 추가)
    const existingIndex = state.students.findIndex(s => s.num === numVal);
    if (existingIndex >= 0) {
      state.students[existingIndex] = newStudent;
    } else {
      state.students.push(newStudent);
    }
    // 번호순 오름차순 정렬
    state.students.sort((a, b) => a.num - b.num);

    // 로컬스토리지 저장
    saveToLocalStorage();

    // Firebase 연동 (가능한 경우)
    if (db) {
      try {
        await db.collection(COLLECTION_NAME).doc(`student_${numVal}`).set(newStudent);
      } catch (err) {
        console.warn("Firestore 저장 실패 (로컬스토리지에는 안전하게 저장됨):", err);
      }
    }

    // UI 새로고침
    updateTeacherDashboard();
    updateSubmittedNumberBadges();

    // 제출 버튼 복구
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>✨ 내 답 제출하기! ✨</span>';
    }

    // 제출 완료 확인 카드 띄우기
    showSubmissionSuccess(newStudent);
  });
}

function showSubmissionSuccess(student) {
  const form = document.getElementById('surveyForm');
  const successCard = document.getElementById('submitSuccessCard');
  if (!successCard) return;

  const titleEl = document.getElementById('successCardTitle');
  if (titleEl) {
    titleEl.textContent = `🎉 ${student.num}번 친구, 답변이 잘 제출되었어요!`;
  }
  document.getElementById('sumNum').textContent = `${student.num}번`;
  document.getElementById('sumColor').textContent = student.color;
  document.getElementById('sumSubject').textContent = student.subject;
  document.getElementById('sumAnimal').textContent = student.animal;
  document.getElementById('sumFood').textContent = student.food || '-';
  document.getElementById('sumHobby').textContent = student.hobby || '-';

  form.classList.add('hidden');
  successCard.classList.remove('hidden');

  // 축하 꽃가루 효과 (풍성하게 2연타 발사)
  if (window.confetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  }

  // 완료 카드로 부드럽게 스크롤
  successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showStatusMsg(el, text, type) {
  el.textContent = text;
  el.className = `form-status-msg ${type}`;
}

function resetStudentForm() {
  document.getElementById('surveyForm').reset();
  state.selectedForm = { num: '', color: '', subject: '', animal: '', food: '', hobby: '' };
  highlightSelectedNumber(null);
  document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('selected'));
  const numStatusText = document.getElementById('numStatusText');
  if (numStatusText) {
    numStatusText.className = 'status-tip';
    numStatusText.textContent = '';
  }
  document.getElementById('formStatusMsg').textContent = '';
}

// ------------------------------------------------------------------
// 8. 탭 전환 (학생 설문 vs 선생님 모드 - 비밀번호 0815 인증)
// ------------------------------------------------------------------
function initNavigationTabs() {
  const tabStudentBtn = document.getElementById('tabStudentBtn');
  const tabTeacherBtn = document.getElementById('tabTeacherBtn');
  const lockTeacherBtn = document.getElementById('lockTeacherBtn');

  tabStudentBtn.addEventListener('click', () => {
    switchToStudentMode();
  });

  tabTeacherBtn.addEventListener('click', () => {
    // 세션 인증 여부 확인
    if (sessionStorage.getItem('teacher_auth') === 'true') {
      switchToTeacherMode();
    } else {
      openPasswordModal();
    }
  });

  if (lockTeacherBtn) {
    lockTeacherBtn.addEventListener('click', () => {
      sessionStorage.removeItem('teacher_auth');
      switchToStudentMode();
      alert("🔒 선생님 모드가 잠겼습니다. 다시 접속하려면 비밀번호(0815)를 입력해야 합니다.");
    });
  }
}

function switchToTeacherMode() {
  const tabStudentBtn = document.getElementById('tabStudentBtn');
  const tabTeacherBtn = document.getElementById('tabTeacherBtn');
  const studentSection = document.getElementById('studentSection');
  const teacherSection = document.getElementById('teacherSection');

  state.activeTab = 'teacher';
  tabTeacherBtn.classList.add('active');
  tabStudentBtn.classList.remove('active');
  teacherSection.classList.remove('hidden');
  studentSection.classList.add('hidden');
  renderSpreadsheet();
  updateTeacherDashboard();
}

function switchToStudentMode() {
  const tabStudentBtn = document.getElementById('tabStudentBtn');
  const tabTeacherBtn = document.getElementById('tabTeacherBtn');
  const studentSection = document.getElementById('studentSection');
  const teacherSection = document.getElementById('teacherSection');

  state.activeTab = 'student';
  tabStudentBtn.classList.add('active');
  tabTeacherBtn.classList.remove('active');
  studentSection.classList.remove('hidden');
  teacherSection.classList.add('hidden');
}


// ------------------------------------------------------------------
// 9. 선생님 관리자 대시보드 & 엔트리 테이블 뷰어 (스크린샷 모양 완벽 재현)
// ------------------------------------------------------------------
function initTeacherControls() {
  // 뷰 전환 탭 (색깔, 과목, 동물, 종합)
  const viewTabs = document.querySelectorAll('.view-tab-btn');
  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      viewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentTableView = tab.dataset.view;
      renderSpreadsheet();
    });
  });

  // 25명 샘플 데이터 채우기 버튼
  document.getElementById('loadSampleDataBtn').addEventListener('click', () => {
    if (confirm("25명의 모의 5학년 학생 관심사 데이터를 채우시겠습니까?\n(스크린샷과 동일한 1~10번 색깔 데이터가 포함됩니다)")) {
      state.students = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_STUDENTS));
      saveToLocalStorage();
      if (db) {
        // Firestore 일괄 업로드
        const batch = db.batch();
        state.students.forEach(s => {
          const docRef = db.collection(COLLECTION_NAME).doc(`student_${s.num}`);
          batch.set(docRef, s);
        });
        batch.commit().catch(e => console.warn(e));
      }
      renderSpreadsheet();
      updateTeacherDashboard();
      updateSubmittedNumberBadges();
      alert("✅ 25명 샘플 데이터가 성공적으로 채워졌습니다! 엑셀 파일로 바로 다운로드해보세요.");
    }
  });

  // 새로고침 버튼
  document.getElementById('refreshDataBtn').addEventListener('click', () => {
    loadStudentsData();
  });
}


/**
 * 스크린샷과 정확히 동일한 형식의 엔트리 스프레드시트 렌더링
 */
function renderSpreadsheet() {
  const thead = document.getElementById('spreadsheetThead');
  const tbody = document.getElementById('spreadsheetTbody');
  const emptyNotice = document.getElementById('tableEmptyNotice');

  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (!state.students || state.students.length === 0) {
    emptyNotice.classList.remove('hidden');
    return;
  }
  emptyNotice.classList.add('hidden');

  let colHeaders = [];
  let colKeys = [];

  if (state.currentTableView === 'color') {
    colHeaders = ['친구번호', '색깔'];
    colKeys = ['num', 'color'];
  } else if (state.currentTableView === 'subject') {
    colHeaders = ['친구번호', '과목'];
    colKeys = ['num', 'subject'];
  } else if (state.currentTableView === 'animal') {
    colHeaders = ['친구번호', '동물'];
    colKeys = ['num', 'animal'];
  } else {
    // total
    colHeaders = ['친구번호', '색깔', '과목', '동물', '음식', '여가활동'];
    colKeys = ['num', 'color', 'subject', 'animal', 'food', 'hobby'];
  }

  // 1) A, B, C... 열 알파벳 행 (엔트리 스타일)
  const alphabetRow = document.createElement('tr');
  alphabetRow.className = 'col-label-row';
  
  // 좌상단 모서리 빈 셀
  const cornerTh = document.createElement('th');
  cornerTh.className = 'corner-cell';
  cornerTh.textContent = '';
  alphabetRow.appendChild(cornerTh);

  colHeaders.forEach((_, idx) => {
    const th = document.createElement('th');
    th.textContent = String.fromCharCode(65 + idx); // A, B, C, D...
    alphabetRow.appendChild(th);
  });

  // 관리 열
  const actionTh = document.createElement('th');
  actionTh.textContent = '수정/삭제';
  actionTh.style.width = '85px';
  alphabetRow.appendChild(actionTh);

  thead.appendChild(alphabetRow);

  // 2) 1행: 속성 이름 (친구번호, 색깔...)
  const headerDataRow = document.createElement('tr');
  headerDataRow.className = 'data-header-row';

  const row1NumTd = document.createElement('td');
  row1NumTd.className = 'row-num-cell';
  row1NumTd.textContent = '1';
  headerDataRow.appendChild(row1NumTd);

  colHeaders.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerDataRow.appendChild(th);
  });

  const emptyActionTd = document.createElement('td');
  emptyActionTd.textContent = '-';
  emptyActionTd.style.color = '#94a3b8';
  headerDataRow.appendChild(emptyActionTd);

  thead.appendChild(headerDataRow);

  // 3) 2행부터: 실제 데이터 행 (2, 3, 4...)
  state.students.forEach((student, index) => {
    const tr = document.createElement('tr');

    // 행 번호 (2부터 시작)
    const rowNumTd = document.createElement('td');
    rowNumTd.className = 'row-num-cell';
    rowNumTd.textContent = (index + 2).toString();
    tr.appendChild(rowNumTd);

    // 각 열 데이터
    colKeys.forEach(key => {
      const td = document.createElement('td');
      td.textContent = student[key] || '-';
      tr.appendChild(td);
    });

    // 관리 버튼 열 (수정, 삭제)
    const actionTd = document.createElement('td');
    actionTd.className = 'cell-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-inline-edit';
    editBtn.textContent = '✏️';
    editBtn.title = '이 행 수정하기';
    editBtn.onclick = () => openEditModal(student);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn-inline-del';
    delBtn.textContent = '❌';
    delBtn.title = '이 행 삭제하기';
    delBtn.onclick = () => deleteStudent(student.num);

    actionTd.appendChild(editBtn);
    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
}

function updateTeacherDashboard() {
  const count = state.students.length;
  document.getElementById('statTotalCount').textContent = `${count}명`;
  document.getElementById('responseCountBadge').textContent = `${count}명`;

  if (count === 0) {
    document.getElementById('statTopColor').textContent = '-';
    document.getElementById('statTopSubject').textContent = '-';
    document.getElementById('statTopAnimal').textContent = '-';
    return;
  }

  // 최다 색깔
  const colorCounts = {};
  state.students.forEach(s => {
    if (s.color) colorCounts[s.color] = (colorCounts[s.color] || 0) + 1;
  });
  const topColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('statTopColor').textContent = topColor ? `${topColor[0]} (${topColor[1]}명)` : '-';

  // 최다 과목
  const subjectCounts = {};
  state.students.forEach(s => {
    if (s.subject && s.subject !== '미입력') subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
  });
  const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('statTopSubject').textContent = topSubject ? `${topSubject[0]} (${topSubject[1]}명)` : '-';

  // 최다 동물
  const animalCounts = {};
  state.students.forEach(s => {
    if (s.animal && s.animal !== '미입력') animalCounts[s.animal] = (animalCounts[s.animal] || 0) + 1;
  });
  const topAnimal = Object.entries(animalCounts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('statTopAnimal').textContent = topAnimal ? `${topAnimal[0]} (${topAnimal[1]}명)` : '-';
}

function updateSubmittedNumberBadges() {
  const submittedNumbers = new Set(state.students.map(s => s.num));
  const buttons = document.querySelectorAll('.quick-number-grid .num-btn');
  buttons.forEach(btn => {
    const num = parseInt(btn.dataset.num, 10);
    if (submittedNumbers.has(num)) {
      btn.classList.add('has-data');
      btn.setAttribute('title', `${num}번: 이미 제출 완료됨 (클릭하여 수정 가능)`);
    } else {
      btn.classList.remove('has-data');
      btn.setAttribute('title', `${num}번 (미제출)`);
    }
  });
}

// ------------------------------------------------------------------
// 10. 엑셀 (.xlsx) 및 엔트리용 CSV 다운로드 로직 (전체 테이블 단일 파일)
// ------------------------------------------------------------------
function initDownloadButtons() {
  const totalHeaders = ['친구번호', '색깔', '과목', '동물', '좋아하는음식', '여가활동'];
  const totalRowMapper = s => [s.num, s.color, s.subject, s.animal, s.food || '-', s.hobby || '-'];

  const excelBtn = document.getElementById('dlTotalExcelBtn');
  if (excelBtn) {
    excelBtn.addEventListener('click', () => {
      exportDataset('xlsx', '초등5학년_우리반_관심사_전체데이터', totalHeaders, totalRowMapper);
    });
  }

  const csvBtn = document.getElementById('dlTotalCsvBtn');
  if (csvBtn) {
    csvBtn.addEventListener('click', () => {
      exportDataset('csv', '초등5학년_우리반_관심사_전체데이터', totalHeaders, totalRowMapper);
    });
  }
}


/**
 * 엑셀 또는 CSV 다운로드 처리
 */
function exportDataset(format, baseFilename, headers, rowMapper) {
  if (state.students.length === 0) {
    alert("다운로드할 학생 데이터가 없습니다! 먼저 학생 설문을 제출하거나 [25명 샘플 데이터 채우기]를 눌러주세요.");
    return;
  }

  // 번호순 정렬
  const sorted = [...state.students].sort((a, b) => a.num - b.num);
  const rows = sorted.map(rowMapper);

  if (format === 'xlsx') {
    // SheetJS를 사용하여 네이티브 엑셀 .xlsx 파일 생성
    if (typeof XLSX === 'undefined') {
      alert("SheetJS 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const dataMatrix = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(dataMatrix);

    // 열 너비 자동 설정
    const colWidths = headers.map((h, i) => {
      let maxLen = h.length;
      rows.forEach(r => {
        const valStr = String(r[i] || '');
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: Math.max(maxLen * 2.2, 14) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "엔트리_데이터");
    XLSX.writeFile(wb, `${baseFilename}.xlsx`);

  } else if (format === 'csv') {
    // 엔트리(Entry) 및 윈도우 엑셀에서 한글 깨짐이 전혀 없는 UTF-8 BOM 인코딩 CSV 생성
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += headers.map(escapeCsvCell).join(",") + "\r\n";

    rows.forEach(row => {
      csvContent += row.map(escapeCsvCell).join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFilename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function escapeCsvCell(cell) {
  const str = String(cell == null ? '' : cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ------------------------------------------------------------------
// 11. 행 추가 및 수정 모달 (선생님 수동 편집 도구)
// ------------------------------------------------------------------
function initEditModal() {
  const modal = document.getElementById('editDataModal');
  const closeBtn = document.getElementById('closeEditModalBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const form = document.getElementById('editDataForm');
  const openAddBtn = document.getElementById('openAddModalBtn');

  openAddBtn.addEventListener('click', () => {
    document.getElementById('editModalTitle').textContent = '➕ 학생 데이터 직접 추가';
    form.reset();
    // 자동으로 비어있는 다음 번호 추정
    const usedNumbers = new Set(state.students.map(s => s.num));
    let nextNum = 1;
    while (usedNumbers.has(nextNum)) nextNum++;
    document.getElementById('editNumInput').value = nextNum;
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const num = parseInt(document.getElementById('editNumInput').value, 10);
    const color = document.getElementById('editColorInput').value.trim();
    const subject = document.getElementById('editSubjectInput').value.trim() || '미입력';
    const animal = document.getElementById('editAnimalInput').value.trim() || '미입력';
    const food = document.getElementById('editFoodInput').value.trim() || '-';
    const hobby = document.getElementById('editHobbyInput').value.trim() || '-';

    const item = { num, color, subject, animal, food, hobby, timestamp: new Date().toISOString() };
    
    const existingIndex = state.students.findIndex(s => s.num === num);
    if (existingIndex >= 0) {
      state.students[existingIndex] = item;
    } else {
      state.students.push(item);
    }
    state.students.sort((a, b) => a.num - b.num);

    saveToLocalStorage();
    if (db) {
      db.collection(COLLECTION_NAME).doc(`student_${num}`).set(item).catch(e => console.warn(e));
    }

    modal.classList.add('hidden');
    renderSpreadsheet();
    updateTeacherDashboard();
    updateSubmittedNumberBadges();
  });
}

function openEditModal(student) {
  document.getElementById('editModalTitle').textContent = `✏️ ${student.num}번 학생 데이터 수정`;
  document.getElementById('editNumInput').value = student.num;
  document.getElementById('editColorInput').value = student.color || '';
  document.getElementById('editSubjectInput').value = student.subject || '';
  document.getElementById('editAnimalInput').value = student.animal || '';
  document.getElementById('editFoodInput').value = student.food || '';
  document.getElementById('editHobbyInput').value = student.hobby || '';
  document.getElementById('editDataModal').classList.remove('hidden');
}

function deleteStudent(num) {
  if (confirm(`${num}번 학생의 데이터를 삭제하시겠습니까?`)) {
    state.students = state.students.filter(s => s.num !== num);
    saveToLocalStorage();
    if (db) {
      db.collection(COLLECTION_NAME).doc(`student_${num}`).delete().catch(e => console.warn(e));
    }
    renderSpreadsheet();
    updateTeacherDashboard();
    updateSubmittedNumberBadges();
  }
}

// ------------------------------------------------------------------
// 11-2. 선생님 모드 비밀번호 인증 모달 처리 (비밀번호: 0815)
// ------------------------------------------------------------------
function initPasswordModal() {
  const modal = document.getElementById('passwordModal');
  const form = document.getElementById('passwordForm');
  const passwordInput = document.getElementById('adminPasswordInput');
  const errorMsg = document.getElementById('passwordErrorMsg');
  const closeBtn = document.getElementById('closePasswordModalBtn');
  const cancelBtn = document.getElementById('cancelPasswordBtn');

  if (!modal || !form) return;

  function closeModal() {
    modal.classList.add('hidden');
    passwordInput.value = '';
    errorMsg.classList.add('hidden');
  }

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = passwordInput.value.trim();

    if (entered === TEACHER_PASSWORD) {
      sessionStorage.setItem('teacher_auth', 'true');
      closeModal();
      switchToTeacherMode();
    } else {
      errorMsg.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
}

function openPasswordModal() {
  const modal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('adminPasswordInput');
  const errorMsg = document.getElementById('passwordErrorMsg');

  if (!modal) return;
  passwordInput.value = '';
  errorMsg.classList.add('hidden');
  modal.classList.remove('hidden');
  setTimeout(() => passwordInput.focus(), 120);
}

// ------------------------------------------------------------------
// 11-3. 전체 데이터 삭제 메뉴 & 안전 확인 모달 처리
// ------------------------------------------------------------------
function initDeleteAllModal() {
  const modal = document.getElementById('deleteConfirmModal');
  const openBannerBtn = document.getElementById('clearAllDataBtn');
  const openTableBtn = document.getElementById('tableDeleteAllBtn');
  const closeBtn = document.getElementById('closeDeleteConfirmModalBtn');
  const cancelBtn = document.getElementById('cancelDeleteAllBtn');
  const confirmBtn = document.getElementById('confirmDeleteAllBtn');

  if (!modal) return;

  function openModal() {
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  if (openBannerBtn) openBannerBtn.addEventListener('click', openModal);
  if (openTableBtn) openTableBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = '삭제 중...';

      state.students = [];
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      if (db) {
        try {
          const snapshot = await db.collection(COLLECTION_NAME).get();
          if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }
        } catch (err) {
          console.warn("Firestore 전체 삭제 오류:", err);
        }
      }

      confirmBtn.disabled = false;
      confirmBtn.textContent = '네, 모두 삭제합니다';
      closeModal();
      renderSpreadsheet();
      updateTeacherDashboard();
      updateSubmittedNumberBadges();
      alert("✅ 모든 학생 관심사 데이터가 완전히 삭제되었습니다.\n이제 새로운 설문 데이터를 수집할 수 있습니다.");
    });
  }
}

// ------------------------------------------------------------------
// 12. 저장소 동기화 (LocalStorage & Firestore)
// ------------------------------------------------------------------
function saveToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.students));
  } catch (err) {
    console.warn("LocalStorage 저장 오류:", err);
  }
}

async function loadStudentsData() {
  // 1) 로컬스토리지 우선 로드
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      state.students = JSON.parse(raw);
    } else {
      // 최초 실행 시 기본 25명 샘플 로드
      state.students = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_STUDENTS));
      saveToLocalStorage();
    }
  } catch (e) {
    state.students = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_STUDENTS));
  }

  // 2) Firestore에 연결된 경우 실시간(onSnapshot) 양방향 동기화
  if (db) {
    try {
      db.collection(COLLECTION_NAME).onSnapshot((snap) => {
        if (!snap.empty) {
          const cloudData = [];
          snap.forEach(doc => {
            cloudData.push(doc.data());
          });
          if (cloudData.length > 0) {
            state.students = cloudData.sort((a, b) => a.num - b.num);
            saveToLocalStorage();
            updateTeacherDashboard();
            updateSubmittedNumberBadges();
            renderSpreadsheet();
          }
        }
      }, (err) => {
        console.warn("Firestore 실시간 리스너 오류 (로컬 모드로 동작):", err);
      });
    } catch (err) {
      console.warn("Firestore 동기화 건너뜀 (로컬 데이터 사용):", err);
    }
  }

  updateTeacherDashboard();
  updateSubmittedNumberBadges();
  renderSpreadsheet();
}

