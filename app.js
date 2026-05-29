/**
 * ITS Practice — Quiz Engine
 * Reads exam data from JSON, renders questions, tracks answers, and scores.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Read exam ID and Mode from URL ---
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('exam') || 'ch1';
    const quizMode = params.get('mode') || 'exam'; // 'exam' or 'practice'

    // --- Load question bank from global variable (loaded via questions.js) ---
    let chapterQuestions = [];
    const data = typeof QUESTION_BANK !== 'undefined' ? QUESTION_BANK : null;

    if (!data) {
        document.getElementById('question-container').innerHTML =
            '<div style="padding:48px;text-align:center;color:#c00;">載入題庫失敗：找不到 QUESTION_BANK 變數，請確認 questions.js 已正確載入。</div>';
        return;
    }

    const chapterMap = {
        'ch1': '第一章',
        'ch2': '第二章',
        'ch3': '第三章',
        'ch4': '第四章',
        'ch5': '第五章',
        'ch6': '第六章',
        'ch7': '第七章',
        'ch8': '第八章',
        'ch9': '第九章',
        'ch10': '第十章',
    };

    const chapterKey = chapterMap[examId];
    if (chapterKey && data.chapters[chapterKey]) {
        chapterQuestions = data.chapters[chapterKey];
    } else {
        document.getElementById('question-container').innerHTML =
            '<div style="padding:48px;text-align:center;color:#888;">找不到該考卷的題目資料。</div>';
        return;
    }

    // --- Build flat question list from big_question / sub_questions ---
    // Each "page" in the quiz = one big_question (may have multiple sub_questions)
    const quizPages = chapterQuestions.map(bq => ({
        bigId: bq.big_question_id,
        bigNumber: bq.big_question_number,
        bigTitle: bq.big_question_title,
        sharedCode: bq.shared_code_context || '',
        subQuestions: bq.sub_questions,
    }));

    // --- State ---
    let userAnswers = {}; // keyed by sub_question id
    let flaggedQuestions = new Set();
    let checkedPages = new Set(); // tracks pages that have been 'checked' in practice mode
    let currentIndex = 0;
    let isFinished = false;

    // --- Timer ---
    // Time based on question count: ~1 min per sub-question
    const totalSubQ = quizPages.reduce((s, p) => s + p.subQuestions.length, 0);
    let totalSeconds = Math.max(totalSubQ * 60, 5 * 60);
    const timerElement = document.getElementById('time-display');
    let timerInterval;

    function formatTime(secs) {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    timerElement.textContent = formatTime(totalSeconds);

    function updateTimer() {
        if (totalSeconds <= 0 || isFinished) {
            clearInterval(timerInterval);
            if (totalSeconds <= 0 && !isFinished) {
                saveAnswers();
                showResults();
            }
            return;
        }
        totalSeconds--;
        timerElement.textContent = formatTime(totalSeconds);
    }
    timerInterval = setInterval(updateTimer, 1000);

    // --- DOM Elements ---
    const questionContainer = document.getElementById('question-container');
    const headerTitle = document.getElementById('header-title');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const btnFlag = document.getElementById('btn-flag');
    const totalQElement = document.getElementById('total-questions');

    totalQElement.textContent = quizPages.length;

    // --- Render ---
    function renderQuestion(index) {
        if (isFinished) return;
        const page = quizPages[index];

        headerTitle.innerHTML = `題目 <span>${index + 1}</span> / <span>${quizPages.length}</span>`;

        updateFlagButtonVisuals(index);

        const circleNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
        const isFillInBlank = page.sharedCode && page.sharedCode.includes('①');
        const isDragDrop = isFillInBlank && (page.bigTitle.includes('拖曳') || page.subQuestions.some(sq => sq.question.includes('拖曳')));

        // Build code context display
        let codeHtml = '';
        let targetCodeForBlanks = '';

        if (page.sharedCode) {
            let originalCode = page.sharedCode;
            let refactoredCode = null;

            if (page.sharedCode.includes('原程式碼：') && page.sharedCode.includes('重構後：')) {
                const parts = page.sharedCode.split('重構後：');
                originalCode = parts[0].replace('原程式碼：', '').trim();
                refactoredCode = parts[1].trim();
            }

            let highlightedOriginal = highlightJava(escapeHtml(originalCode));
            
            if (refactoredCode !== null) {
                let highlightedRefactored = highlightJava(escapeHtml(refactoredCode));
                if (isFillInBlank) {
                    page.subQuestions.forEach((sq, i) => {
                        let blankHtml = '';
                        if (isDragDrop) {
                            blankHtml = `<span class="drop-zone" data-qid="${sq.id}"><span class="drop-text">請拖曳至此</span></span>`;
                        } else {
                            let optionsHtml = `<option value="" disabled selected>請選擇...</option>`;
                            Object.entries(sq.options).forEach(([key, val]) => {
                                optionsHtml += `<option value="${key}">${escapeHtml(val)}</option>`;
                            });
                            blankHtml = `<select class="inline-select" data-qid="${sq.id}">${optionsHtml}</select>`;
                        }
                        const regex = new RegExp(`_*${circleNumbers[i]}_*`, 'g');
                        highlightedRefactored = highlightedRefactored.replace(regex, blankHtml);
                    });
                }
                
                codeHtml = `
                    <div class="code-viewer" style="margin-bottom: 20px;">
                        <pre class="line-numbers"><code>${highlightedOriginal}</code></pre>
                    </div>
                `;
                targetCodeForBlanks = `
                    <div class="code-viewer" style="margin-bottom: 20px;">
                        <pre class="line-numbers"><code>${highlightedRefactored}</code></pre>
                    </div>
                `;
            } else {
                if (isFillInBlank) {
                    page.subQuestions.forEach((sq, i) => {
                        let blankHtml = '';
                        if (isDragDrop) {
                            blankHtml = `<span class="drop-zone" data-qid="${sq.id}"><span class="drop-text">請拖曳至此</span></span>`;
                        } else {
                            let optionsHtml = `<option value="" disabled selected>請選擇...</option>`;
                            Object.entries(sq.options).forEach(([key, val]) => {
                                optionsHtml += `<option value="${key}">${escapeHtml(val)}</option>`;
                            });
                            blankHtml = `<select class="inline-select" data-qid="${sq.id}">${optionsHtml}</select>`;
                        }
                        const regex = new RegExp(`_*${circleNumbers[i]}_*`, 'g');
                        highlightedOriginal = highlightedOriginal.replace(regex, blankHtml);
                    });
                }
                
                let blockHtml = `
                    <div class="code-viewer" style="margin-bottom: 20px;">
                        <pre class="line-numbers"><code>${highlightedOriginal}</code></pre>
                    </div>
                `;
                
                if (isFillInBlank) {
                    targetCodeForBlanks = blockHtml;
                } else {
                    codeHtml = blockHtml;
                }
            }
        }

        // Build sub-questions (radio/checkboxes) if not fill-in-the-blank
        let subQHtml = '';
        if (!isFillInBlank) {
            if (page.subQuestions.length === 1 && !page.sharedCode) {
                const sq = page.subQuestions[0];
                subQHtml = buildSingleChoiceHtml(sq);
            } else {
                page.subQuestions.forEach((sq, i) => {
                    subQHtml += `
                        <div class="sub-question" ${page.subQuestions.length > 1 ? 'style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color);"' : ''}>
                            ${page.subQuestions.length > 1 ? `<div class="sub-q-label">小題 ${sq.sub_question_number}</div>` : ''}
                            ${buildSingleChoiceHtml(sq)}
                        </div>
                    `;
                });
            }
        }

        const isMultiChoice = page.subQuestions.some(sq => sq.answer && sq.answer.includes(','));

        let answerAreaHtml = '';
        if (isFillInBlank) {
            let optionsBankHtml = '';
            let noteText = '';
            
            if (isDragDrop) {
                optionsBankHtml = '<div class="options-bank" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding: 16px; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: var(--radius-md);">';
                const firstSqOptions = page.subQuestions[0].options;
                Object.entries(firstSqOptions).forEach(([key, val]) => {
                    optionsBankHtml += `<div class="option-item draggable-option" draggable="true" data-key="${key}" data-text="${escapeHtml(val)}" style="font-size: 13px; color: var(--text-secondary); cursor: grab; padding: 6px 10px; border: 1px dashed var(--accent-blue); border-radius: 4px; background: #f8fafc;"><strong style="color: var(--accent-blue);">(${key})</strong> <code style="background: transparent;">${escapeHtml(val)}</code></div>`;
                });
                optionsBankHtml += '</div>';
                noteText = '請將適當的選項拖曳到下列程式碼中的正確位置。每個選項皆可被使用一次以上，或完全不用。';
            } else {
                noteText = '請從下拉式清單中選取正確的程式碼片段以完成程式碼。';
            }

            answerAreaHtml = `
                <div class="q-answer-area">
                    <div class="area-label">作答區</div>
                    <p class="note" style="margin-bottom: 12px;">${noteText}</p>
                    ${optionsBankHtml}
                    ${targetCodeForBlanks}
                </div>
            `;
        } else {
            answerAreaHtml = `
                <div class="q-answer-area">
                    <div class="area-label">作答區</div>
                    ${subQHtml}
                </div>
            `;
        }

        questionContainer.innerHTML = `
            <div class="q-layout-single">
                <div class="q-instruction">
                    <p class="big-q-title">${escapeHtml(page.bigTitle)}</p>
                    ${isMultiChoice && !isFillInBlank ? '<p class="note">提示：部分題目可能有多個正確答案，請選擇所有正確的選項。</p>' : ''}
                </div>
                ${codeHtml}
                ${answerAreaHtml}
            </div>
        `;

        // Attach drag and drop listeners
        if (isDragDrop) {
            const draggables = questionContainer.querySelectorAll('.draggable-option');
            const dropZones = questionContainer.querySelectorAll('.drop-zone');

            draggables.forEach(draggable => {
                draggable.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', draggable.dataset.key);
                });
            });

            dropZones.forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    zone.classList.add('drag-over');
                });
                zone.addEventListener('dragleave', () => {
                    zone.classList.remove('drag-over');
                });
                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zone.classList.remove('drag-over');
                    const key = e.dataTransfer.getData('text/plain');
                    if (key) {
                        const optionEl = document.querySelector(`.draggable-option[data-key="${key}"]`);
                        if (optionEl) {
                            zone.dataset.value = key;
                            zone.innerHTML = `<span class="dropped-text" style="color: var(--accent-blue); font-weight: 600;">(${key}) ${optionEl.dataset.text}</span> <button class="clear-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-left:4px;">&times;</button>`;
                            
                            const clearBtn = zone.querySelector('.clear-btn');
                            clearBtn.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                zone.dataset.value = '';
                                zone.innerHTML = '<span class="drop-text">請拖曳至此</span>';
                            });
                        }
                    }
                });
            });
        }

        // Restore answers
        restoreAnswers(page);

        // Footer UI
        const isLastPage = index === quizPages.length - 1;
        btnPrev.disabled = index === 0;
        btnPrev.style.opacity = index === 0 ? '0.5' : '1';
        btnPrev.style.cursor = index === 0 ? 'not-allowed' : 'pointer';

        const btnCheck = document.getElementById('btn-check');
        if (quizMode === 'practice') {
            const isChecked = checkedPages.has(index);
            if (isChecked) {
                // Already checked
                btnCheck.style.display = 'none';
                if (isLastPage) {
                    btnNext.style.display = 'none';
                    btnSubmit.style.display = 'inline-block';
                } else {
                    btnNext.style.display = 'inline-block';
                    btnSubmit.style.display = 'none';
                }
                
                // Show explanations again
                showPracticeFeedback(index);
            } else {
                // Not checked yet
                btnCheck.style.display = 'inline-block';
                btnNext.style.display = 'none';
                btnSubmit.style.display = 'none';
            }
        } else {
            // Exam Mode
            btnCheck.style.display = 'none';
            if (isLastPage) {
                btnNext.style.display = 'none';
                btnSubmit.style.display = 'inline-block';
            } else {
                btnNext.style.display = 'inline-block';
                btnSubmit.style.display = 'none';
            }
        }
    }

    function buildSingleChoiceHtml(sq) {
        const isMulti = sq.answer && sq.answer.includes(',');
        const inputType = isMulti ? 'checkbox' : 'radio';
        let optionsHtml = '';

        Object.entries(sq.options).forEach(([key, val]) => {
            const inputName = isMulti ? `sq_${sq.id}_${key}` : `sq_${sq.id}`;
            optionsHtml += `
                <label class="option-label" data-qid="${sq.id}" data-key="${key}">
                    <input type="${inputType}" name="${inputName}" value="${key}" data-qid="${sq.id}" data-key="${key}">
                    <span class="option-key">${key}</span>
                    <span class="option-text">${escapeHtml(val)}</span>
                </label>
            `;
        });

        return `
            <div class="choice-question" data-sqid="${sq.id}">
                <p class="sq-text">${escapeHtml(sq.question)}</p>
                <div class="options-list">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }

    // --- Save / Restore ---
    function saveAnswers() {
        if (isFinished) return;
        const page = quizPages[currentIndex];
        page.subQuestions.forEach(sq => {
            const isMulti = sq.answer && sq.answer.includes(',');
            if (isMulti) {
                const checked = questionContainer.querySelectorAll(`input[data-qid="${sq.id}"]:checked`);
                const keys = Array.from(checked).map(el => el.dataset.key);
                if (keys.length > 0) userAnswers[sq.id] = keys.join(',');
            } else {
                // Try dropdown first
                const selectEl = questionContainer.querySelector(`select[data-qid="${sq.id}"]`);
                if (selectEl) {
                    if (selectEl.value) userAnswers[sq.id] = selectEl.value;
                } else {
                    // Try drag-drop zone
                    const dropZone = questionContainer.querySelector(`.drop-zone[data-qid="${sq.id}"]`);
                    if (dropZone) {
                        if (dropZone.dataset.value) userAnswers[sq.id] = dropZone.dataset.value;
                    } else {
                        // Try radio
                        const checked = questionContainer.querySelector(`input[data-qid="${sq.id}"]:checked`);
                        if (checked) userAnswers[sq.id] = checked.value;
                    }
                }
            }
        });
    }

    function restoreAnswers(page) {
        page.subQuestions.forEach(sq => {
            const val = userAnswers[sq.id];
            if (!val) return;
            const isMulti = sq.answer && sq.answer.includes(',');
            if (isMulti) {
                const keys = val.split(',');
                keys.forEach(k => {
                    const el = questionContainer.querySelector(`input[data-qid="${sq.id}"][data-key="${k}"]`);
                    if (el) el.checked = true;
                });
            } else {
                const selectEl = questionContainer.querySelector(`select[data-qid="${sq.id}"]`);
                if (selectEl) {
                    selectEl.value = val;
                } else {
                    const dropZone = questionContainer.querySelector(`.drop-zone[data-qid="${sq.id}"]`);
                    if (dropZone) {
                        const optionEl = questionContainer.querySelector(`.draggable-option[data-key="${val}"]`);
                        if (optionEl) {
                            dropZone.dataset.value = val;
                            dropZone.innerHTML = `<span class="dropped-text" style="color: var(--accent-blue); font-weight: 600;">(${val}) ${optionEl.dataset.text}</span> <button class="clear-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-left:4px;">&times;</button>`;
                            const clearBtn = dropZone.querySelector('.clear-btn');
                            clearBtn.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                dropZone.dataset.value = '';
                                dropZone.innerHTML = '<span class="drop-text">請拖曳至此</span>';
                            });
                        }
                    } else {
                        const el = questionContainer.querySelector(`input[data-qid="${sq.id}"][value="${val}"]`);
                        if (el) el.checked = true;
                    }
                }
            }
        });
    }

    // --- Events ---
    btnNext.addEventListener('click', () => {
        if (currentIndex < quizPages.length - 1) {
            saveAnswers();
            currentIndex++;
            renderQuestion(currentIndex);
            questionContainer.scrollTop = 0;
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentIndex > 0) {
            saveAnswers();
            currentIndex--;
            renderQuestion(currentIndex);
            questionContainer.scrollTop = 0;
        }
    });

    btnFlag.addEventListener('click', () => {
        if (flaggedQuestions.has(currentIndex)) {
            flaggedQuestions.delete(currentIndex);
        } else {
            flaggedQuestions.add(currentIndex);
        }
        updateFlagButtonVisuals(currentIndex);
    });

    const btnCheck = document.getElementById('btn-check');
    if (btnCheck) {
        btnCheck.addEventListener('click', () => {
            saveAnswers();
            checkedPages.add(currentIndex);
            
            // Re-render footer buttons
            renderQuestion(currentIndex);
            
            // Scroll to feedback
            setTimeout(() => {
                const fb = document.querySelector('.practice-feedback-container');
                if (fb) fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    }

    function showPracticeFeedback(index) {
        const page = quizPages[index];
        let feedbackHtml = '<div class="practice-feedback-container" style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 20px;">';
        
        page.subQuestions.forEach(sq => {
            const userAns = userAnswers[sq.id] || '(未作答)';
            const correctAns = sq.answer;
            const normalizeAns = (a) => a.split(',').map(s => s.trim()).sort().join(',');
            const isCorrect = userAns !== '(未作答)' && normalizeAns(userAns) === normalizeAns(correctAns);
            
            feedbackHtml += `
                <div class="feedback-item" style="margin-bottom: 16px; padding: 16px; border-radius: 4px; background: var(--bg-white); border: 1px solid var(--border-color); border-left: 4px solid ${isCorrect ? '#10b981' : '#ef4444'}; box-shadow: var(--shadow-sm);">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span>${sq.question ? escapeHtml(sq.question) : '填空題'}</span>
                        <span style="font-size: 13px; padding: 2px 8px; border-radius: 4px; background: ${isCorrect ? '#ecfdf5' : '#fef2f2'}; color: ${isCorrect ? '#059669' : '#dc2626'};">${isCorrect ? '答對了' : '答錯了'}</span>
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--border-color);">
                        您的答案：<span style="font-family: var(--font-mono); font-weight: 500; color: var(--text-primary);">${userAns}</span>
                        <span style="margin: 0 12px; color: var(--border-color);">|</span>
                        正確答案：<span style="font-family: var(--font-mono); font-weight: 500; color: var(--text-primary);">${correctAns}</span>
                    </div>
                    <div style="font-size: 14px; color: var(--text-primary); line-height: 1.5;">
                        <span style="color: var(--text-secondary); font-weight: 500; margin-right: 4px;">解析：</span>
                        ${escapeHtml(sq.notes || '暫無解析')}
                    </div>
                </div>
            `;
        });
        feedbackHtml += '</div>';

        // Append to question container if not already there
        if (!questionContainer.querySelector('.practice-feedback-container')) {
            questionContainer.insertAdjacentHTML('beforeend', feedbackHtml);
        }

        // Lock inputs
        questionContainer.querySelectorAll('input, select').forEach(el => {
            el.disabled = true;
        });
        
        questionContainer.querySelectorAll('.drop-zone').forEach(el => {
            el.style.pointerEvents = 'none';
            const clearBtn = el.querySelector('.clear-btn');
            if (clearBtn) clearBtn.style.display = 'none';
        });

        questionContainer.querySelectorAll('.draggable-option').forEach(el => {
            el.draggable = false;
            el.style.cursor = 'not-allowed';
            el.style.opacity = '0.5';
        });
    }

    function updateFlagButtonVisuals(index) {
        if (flaggedQuestions.has(index)) {
            btnFlag.style.color = '#eab308';
            btnFlag.textContent = '★ 已標記為待檢查';
        } else {
            btnFlag.style.color = '';
            btnFlag.textContent = '標記為待檢查';
        }
    }

    btnSubmit.addEventListener('click', () => {
        if (!confirm('確定要交卷嗎？交卷後將無法修改答案。')) return;
        saveAnswers();
        showResults();
    });

    // --- Results ---
    function showResults() {
        isFinished = true;
        clearInterval(timerInterval);
        document.querySelector('.app-header').style.display = 'none';
        document.querySelector('.app-footer').style.display = 'none';

        let totalItems = 0;
        let correctItems = 0;
        let detailsHtml = '';

        quizPages.forEach((page, pi) => {
            let pageCorrect = 0;
            let pageTotal = page.subQuestions.length;
            let subDetails = '';

            page.subQuestions.forEach(sq => {
                totalItems++;
                const userAns = userAnswers[sq.id] || '(未作答)';
                const correctAns = sq.answer;
                // Normalize for comparison
                const normalizeAns = (a) => a.split(',').map(s => s.trim()).sort().join(',');
                const isCorrect = userAns !== '(未作答)' && normalizeAns(userAns) === normalizeAns(correctAns);

                if (isCorrect) {
                    correctItems++;
                    pageCorrect++;
                }

                subDetails += `
                    <div class="result-sub ${isCorrect ? 'correct' : 'wrong'}">
                        <div class="result-sub-header">
                            <span class="result-icon">${isCorrect ? '✅' : '❌'}</span>
                            <span class="result-sub-text">${escapeHtml(sq.question)}</span>
                        </div>
                        <div class="result-answer-row">
                            <span>你的答案：<strong>${escapeHtml(userAns)}</strong></span>
                            ${!isCorrect ? `<span>正確答案：<strong class="correct-ans">${escapeHtml(correctAns)}</strong></span>` : ''}
                        </div>
                        ${sq.notes ? `<div class="result-notes">💡 ${escapeHtml(sq.notes)}</div>` : ''}
                    </div>
                `;
            });

            detailsHtml += `
                <div class="result-page">
                    <div class="result-page-header">
                        <h4>第 ${pi + 1} 題：${escapeHtml(page.bigTitle)}</h4>
                        <span class="result-page-score" style="color: ${pageCorrect === pageTotal ? '#19be6b' : (pageCorrect > 0 ? '#ff9900' : '#ed4014')}">${pageCorrect}/${pageTotal}</span>
                    </div>
                    ${subDetails}
                </div>
            `;
        });

        const scorePct = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;

        questionContainer.innerHTML = `
            <div class="results-container">
                <h2>🎉 測驗完成</h2>
                <div class="score-display">
                    <div class="score-circle ${scorePct >= 70 ? 'pass' : 'fail'}">
                        <span class="score-number">${scorePct}</span>
                        <span class="score-percent">%</span>
                    </div>
                </div>
                <div class="results-summary">
                    <p>答對 <strong>${correctItems}</strong> / ${totalItems} 題</p>
                    <p class="score-status">${scorePct >= 70 ? '✅ 通過' : '❌ 未通過 (需達 70%)'}</p>
                </div>
                <div class="results-details">
                    ${detailsHtml}
                </div>
                <div class="results-actions">
                    <a href="index.html" class="btn-nav">回到首頁</a>
                    <button class="btn-nav primary" onclick="location.reload()">重新測驗</button>
                </div>
            </div>
        `;
    }

    // --- Utilities ---
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/\n/g, '\n');
    }

    function highlightJava(code) {
        // Basic Java syntax highlighting
        const keywords = ['public','private','protected','static','void','int','double','float','byte','short','long','char','boolean','String',
                          'if','else','for','while','do','switch','case','default','break','continue','return','new','import','class','this',
                          'true','false','null','final','abstract','extends','implements','try','catch','throw','throws'];
        
        let lines = code.split('\n');
        return lines.map(line => {
            // Highlight strings
            line = line.replace(/(\"[^\"]*\")/g, '<span class="string">$1</span>');
            // Highlight comments
            line = line.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
            // Highlight keywords (only whole words not inside strings/comments)
            keywords.forEach(kw => {
                const regex = new RegExp(`\\b(${kw})\\b`, 'g');
                line = line.replace(regex, (match, p1, offset, str) => {
                    // Simple check: skip if inside a span already
                    const before = str.substring(0, offset);
                    if ((before.match(/<span/g) || []).length > (before.match(/<\/span>/g) || []).length) {
                        return match;
                    }
                    return `<span class="keyword">${match}</span>`;
                });
            });
            return line;
        }).join('\n');
    }

    // --- Init ---
    renderQuestion(currentIndex);
});
