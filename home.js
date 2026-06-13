/**
 * ITS Practice — Homepage Logic (OJ Style)
 * Manages exam catalog rendering with row-based layout.
 */

// ============================================
// Exam Catalog — mapped to JSON chapters
// ============================================
// All chapter definitions for the review feature
const allChapterDefs = [
    { id: 'ch1',   key: '第一章',   label: 'Java 第一章 — 基礎語法與註解',          questionCount: 2  },
    { id: 'ch2',   key: '第二章',   label: 'Java 第二章 — 資料型別與運算',          questionCount: 10 },
    { id: 'ch3',   key: '第三章',   label: 'Java 第三章 — 控制敘述（選擇）',        questionCount: 6  },
    { id: 'ch4',   key: '第四章',   label: 'Java 第四章 — 控制敘述（迴圈）',        questionCount: 6  },
    { id: 'ch5',   key: '第五章',   label: 'Java 第五章 — 陣列',                   questionCount: 6  },
    { id: 'ch6',   key: '第六章',   label: 'Java 第六章 — 方法',                   questionCount: 5  },
    { id: 'ch7',   key: '第七章',   label: 'Java 第七章 — 類別與物件',              questionCount: 7  },
    { id: 'ch8',   key: '第八章',   label: 'Java 第八章 — 繼承與多型',              questionCount: 6  },
    { id: 'ch9',   key: '第九章',   label: 'Java 第九章 — 介面與抽象類別',          questionCount: 7  },
    { id: 'ch10',  key: '第十章',   label: 'Java 第十章 — 例外處理',               questionCount: 6  },
    { id: 'ch11',  key: '第十一章', label: 'Java 第十一章 — 檔案處理',             questionCount: 3  },
    { id: 'ch12',  key: '第十二章', label: 'Java 第十二章 — 集合框架',             questionCount: 4  },
    { id: 'exam1', key: '模擬試題1', label: '模擬試題 1 — Java ITS 考古題',         questionCount: 40 },
    { id: 'exam2', key: '考古題庫2', label: '模擬試題 2 — Java ITS 考古題',         questionCount: 40 },
];

const examCatalog = [
    {
        id: 'review',
        title: '🔖 總複習 — 自選章節混合練習',
        difficulty: 'custom',
        difficultyLabel: '自訂',
        questionCount: null,
        subQuestionCount: null,
        timeMinutes: null,
        type: 'Java ITS',
        date: '2026-6-13',
        topics: '自由選擇任意章節，合併所有題目一次複習',
    },
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

    list.innerHTML = examCatalog.map(exam => {
        const isReview = exam.id === 'review';
        const metaText = isReview
            ? '<span class="exam-row-questions" style="color: var(--accent-blue);">自選章節</span>'
            : `<span class="exam-row-questions">${exam.questionCount} 大題 / ${exam.subQuestionCount} 小題</span>`;
        const rowStyle = isReview ? ' style="border-left: 4px solid var(--accent-blue);"' : '';
        return `
        <div class="exam-row"${rowStyle} onclick="startExam('${exam.id}')">
            <div class="exam-row-main">
                <div class="exam-row-title">${exam.title}</div>
                <div class="exam-row-topics" style="margin-top: 8px;">${exam.topics}</div>
            </div>
            <div class="exam-row-meta">
                ${metaText}
                <span class="exam-row-action">${isReview ? '選擇章節' : '進入考試'} <span class="arrow">→</span></span>
            </div>
        </div>`;
    }).join('');
}

// ============================================
// Start Exam (Show Modal)
// ============================================
let pendingExamId = null;

function startExam(examId) {
    if (examId === 'review') {
        openChapterModal();
    } else {
        pendingExamId = examId;
        const modal = document.getElementById('mode-modal');
        if (modal) modal.style.display = 'flex';
    }
}

function closeModeModal() {
    const modal = document.getElementById('mode-modal');
    if (modal) modal.style.display = 'none';
    pendingExamId = null;
}

function startExamWithMode(mode) {
    if (pendingExamId) {
        const shuffle = document.getElementById('shuffle-checkbox').checked ? '1' : '0';
        if (pendingExamId === 'review') {
            const selected = getSelectedChapterIds();
            window.location.href = `quiz.html?exam=review&chapters=${selected.join(',')}&mode=${mode}&shuffle=${shuffle}`;
        } else {
            window.location.href = `quiz.html?exam=${pendingExamId}&mode=${mode}&shuffle=${shuffle}`;
        }
    }
}

// ============================================
// Chapter Selection Modal (總複習)
// ============================================
function openChapterModal() {
    const checklist = document.getElementById('chapter-checklist');
    if (!checklist) return;

    checklist.innerHTML = allChapterDefs.map(ch => `
        <label class="chapter-check-row" style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--bg-white); border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer; user-select:none;" onclick="updateReviewSummary()">
            <input type="checkbox" class="chapter-checkbox" data-id="${ch.id}" data-count="${ch.questionCount}" style="width:17px; height:17px; cursor:pointer;">
            <span style="flex:1; font-size:14px; color:var(--text-primary);">${ch.label}</span>
            <span style="font-size:12px; color:var(--text-secondary); white-space:nowrap;">${ch.questionCount} 大題</span>
        </label>
    `).join('');

    updateReviewSummary();
    const modal = document.getElementById('chapter-modal');
    if (modal) modal.style.display = 'flex';
}

function closeChapterModal() {
    const modal = document.getElementById('chapter-modal');
    if (modal) modal.style.display = 'none';
}

function selectAllChapters(checked) {
    document.querySelectorAll('.chapter-checkbox').forEach(cb => cb.checked = checked);
    updateReviewSummary();
}

function getSelectedChapterIds() {
    return Array.from(document.querySelectorAll('.chapter-checkbox:checked')).map(cb => cb.dataset.id);
}

function updateReviewSummary() {
    const checkboxes = document.querySelectorAll('.chapter-checkbox:checked');
    const totalQ = Array.from(checkboxes).reduce((s, cb) => s + parseInt(cb.dataset.count), 0);
    const summary = document.getElementById('chapter-summary');
    if (summary) summary.textContent = `已選 ${checkboxes.length} 個章節，共約 ${totalQ} 大題`;
    const btn = document.getElementById('btn-proceed-review');
    if (btn) btn.disabled = checkboxes.length === 0;
}

function proceedToModeFromReview() {
    const selected = getSelectedChapterIds();
    if (selected.length === 0) return;
    closeChapterModal();
    pendingExamId = 'review';
    const modal = document.getElementById('mode-modal');
    if (modal) modal.style.display = 'flex';
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
