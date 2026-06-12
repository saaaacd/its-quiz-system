/**
 * ITS Practice — Homepage Logic (OJ Style)
 * Manages exam catalog rendering with row-based layout.
 */

// ============================================
// Exam Catalog — mapped to JSON chapters
// ============================================
const examCatalog = [
    {
        id: 'exam1',
        title: '📌 模擬試題 1 — Java ITS 考古題',
        difficulty: 'hard',
        difficultyLabel: '模擬考',
        questionCount: 40,
        subQuestionCount: 114,
        timeMinutes: 50,
        type: 'Java ITS',
        date: '2026-6-5',
        topics: '綜合題型：語法、型別、流程控制、物件導向、例外處理',
    },
    {
        id: 'exam2',
        title: '📌 模擬試題 2 — Java ITS 考古題',
        difficulty: 'hard',
        difficultyLabel: '模擬考',
        questionCount: 40,
        subQuestionCount: 113,
        timeMinutes: 50,
        type: 'Java ITS',
        date: '2026-6-13',
        topics: '綜合題型：語法、型別、流程控制、物件導向、例外處理',
    },
    {
        id: 'ch1',
        title: 'Java 第一章 — 基礎語法與註解',
        difficulty: 'easy',
        difficultyLabel: '基礎',
        questionCount: 2,
        subQuestionCount: 2,
        timeMinutes: 5,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: '單行/多行註解',
    },
    {
        id: 'ch2',
        title: 'Java 第二章 — 資料型別與運算',
        difficulty: 'medium',
        difficultyLabel: '中等',
        questionCount: 10,
        subQuestionCount: 20,
        timeMinutes: 20,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: '型別轉換、運算子、格式化輸出、Scanner',
    },
    {
        id: 'ch3',
        title: 'Java 第三章 — 選擇結構',
        difficulty: 'medium',
        difficultyLabel: '中等',
        questionCount: 7,
        subQuestionCount: 24,
        timeMinutes: 25,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: 'if-else、switch-case、邏輯運算子',
    },
    {
        id: 'ch4',
        title: 'Java 第四章 — 迴圈與方法',
        difficulty: 'hard',
        difficultyLabel: '進階',
        questionCount: 6,
        subQuestionCount: 16,
        timeMinutes: 20,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: 'for、while、do-while、break/continue、值傳遞',
    },
    {
        id: 'ch5',
        title: 'Java 第五章 — 陣列',
        difficulty: 'medium',
        difficultyLabel: '中等',
        questionCount: 6,
        subQuestionCount: 11,
        timeMinutes: 15,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: '一維陣列、多維陣列、陣列走訪',
    },
    {
        id: 'ch6',
        title: 'Java 第六章 — 類別與物件',
        difficulty: 'hard',
        difficultyLabel: '進階',
        questionCount: 5,
        subQuestionCount: 18,
        timeMinutes: 20,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: '類別定義、物件建構、this關鍵字',
    },
    {
        id: 'ch7',
        title: 'Java 第七章 — 封裝與建構子',
        difficulty: 'hard',
        difficultyLabel: '進階',
        questionCount: 7,
        subQuestionCount: 22,
        timeMinutes: 25,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: '存取修飾子、封裝、建構子多載',
    },
    {
        id: 'ch8',
        title: 'Java 第八章 — 繼承與多型',
        difficulty: 'hard',
        difficultyLabel: '困難',
        questionCount: 6,
        subQuestionCount: 12,
        timeMinutes: 20,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: '繼承、多型、super關鍵字、方法覆寫',
    },
    {
        id: 'ch9',
        title: 'Java 第九章 — 抽象與介面',
        difficulty: 'hard',
        difficultyLabel: '困難',
        questionCount: 7,
        subQuestionCount: 15,
        timeMinutes: 25,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: '抽象類別、介面實作、預設方法',
    },
    {
        id: 'ch10',
        title: 'Java 第十章 — 例外處理',
        difficulty: 'medium',
        difficultyLabel: '中等',
        questionCount: 6,
        subQuestionCount: 15,
        timeMinutes: 20,
        type: 'Java ITS',
        date: '2026-5-30',
        topics: 'try-catch、throws、自訂例外',
    },
    {
        id: 'ch11',
        title: 'Java 第十一章 — 檔案處理',
        difficulty: 'hard',
        difficultyLabel: '進階',
        questionCount: 3,
        subQuestionCount: 16,
        timeMinutes: 20,
        type: 'Java ITS',
        date: '2026-6-5',
        topics: 'File、FileReader、BufferedReader、FileWriter',
    },
    {
        id: 'ch12',
        title: 'Java 第十二章 — 集合框架',
        difficulty: 'medium',
        difficultyLabel: '中等',
        questionCount: 4,
        subQuestionCount: 4,
        timeMinutes: 10,
        type: 'Java ITS',
        date: '2026-6-5',
        topics: 'ArrayList、HashSet、TreeSet、Collections',
    }
];

// ============================================
// DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderExamList();
    renderPagination();
});

// ============================================
// Render Exam List (Row Style)
// ============================================
function renderExamList() {
    const list = document.getElementById('exam-list');
    if (!list) return;

    list.innerHTML = examCatalog.map(exam => `
        <div class="exam-row" onclick="startExam('${exam.id}')">
            <div class="exam-row-main">
                <div class="exam-row-title">${exam.title}</div>
                <div class="exam-row-topics" style="margin-top: 8px;">${exam.topics}</div>
            </div>
            <div class="exam-row-meta">
                <span class="exam-row-questions">${exam.questionCount} 大題 / ${exam.subQuestionCount} 小題</span>
                <span class="exam-row-action">進入考試 <span class="arrow">→</span></span>
            </div>
        </div>
    `).join('');
}

// ============================================
// Start Exam (Show Modal)
// ============================================
let pendingExamId = null;

function startExam(examId) {
    pendingExamId = examId;
    const modal = document.getElementById('mode-modal');
    if (modal) modal.style.display = 'flex';
}

function closeModeModal() {
    const modal = document.getElementById('mode-modal');
    if (modal) modal.style.display = 'none';
    pendingExamId = null;
}

function startExamWithMode(mode) {
    if (pendingExamId) {
        const shuffle = document.getElementById('shuffle-checkbox').checked ? '1' : '0';
        window.location.href = `quiz.html?exam=${pendingExamId}&mode=${mode}&shuffle=${shuffle}`;
    }
}

// ============================================
// Pagination
// ============================================
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    pagination.innerHTML = `
        <button class="page-btn disabled">&lt;</button>
        <button class="page-btn active">1</button>
        <button class="page-btn disabled">&gt;</button>
    `;
}
