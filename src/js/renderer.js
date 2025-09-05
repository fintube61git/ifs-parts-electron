// renderer.js

// ==========================
// GLOBAL VARIABLES AND STATE
// ==========================
let images = [];
let questions = [];
let answers = {};
let currentIndex = 0;
let zoom = 1;

// Node.js modules for the renderer process
const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

// ==========================
// UTILITY FUNCTIONS
// ==========================
function shuffle(array) {
    return array
    .map(x => [Math.random(), x])
    .sort((a, b) => a[0] - b[0])
    .map(x => x[1]);
}

function getUniqueKey(index) {
    const separator = ':::';
    return images.length ? `${index}${separator}${images[index].path}` : '';
}

function saveAnswer(key, questionId, value) {
    if (!answers[key]) answers[key] = {};
    answers[key][questionId] = value;
}

function getAnswer(key, questionId) {
    return answers[key] ? answers[key][questionId] : null;
}

function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
}

function showMainApp() {
    const mainContent = document.getElementById('main') || document.querySelector('main');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

function showEmptyState(message) {
    const options = document.getElementById('options');
    const canvas = document.getElementById('canvas');

    canvas.src = '';
    canvas.alt = 'No image loaded';

    options.innerHTML = `
    <div class="empty-state">
    <h3>Files not found</h3>
    <p>${message}</p>
    </div>
    `;

    updateCardCounter();
    updateNavigationButtons();
}

// ==========================
// AUTOMATIC FILE LOADING
// ==========================
async function loadFilesOnStartup() {
    const baseDir = __dirname;
    const imagesPath = path.join(baseDir, 'images');
    const questionsPath = path.join(baseDir, 'data', 'questions.json');

    try {
        // Load questions.json
        if (fs.existsSync(questionsPath)) {
            const questionsData = fs.readFileSync(questionsPath, 'utf8');
            questions = JSON.parse(questionsData);
            console.log('✅ Questions loaded successfully.');
        } else {
            showEmptyState('questions.json not found in the data folder.');
            return;
        }

        // Load images
        if (fs.existsSync(imagesPath)) {
            const imageFileNames = fs.readdirSync(imagesPath);
            images = imageFileNames
            .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
            .map(f => ({ name: f, path: path.join(imagesPath, f) }));

            if (images.length > 0) {
                images = shuffle(images);
                console.log(`✅ ${images.length} images loaded successfully.`);
            } else {
                showEmptyState('No valid images found in the images folder.');
                return;
            }
        } else {
            showEmptyState('Images folder not found.');
            return;
        }

        // Initialize the UI once all files are loaded
        showImage();

    } catch (error) {
        console.error('❌ An error occurred during file loading:', error);
        showEmptyState('An error occurred during file loading. Check the console for details.');
    }
}

// ==========================
// IMAGE DISPLAY AND NAVIGATION
// ==========================
function showImage() {
    if (!images.length || !questions.length) {
        showEmptyState('Please ensure your images folder and questions.json file are present.');
        return;
    }

    const canvas = document.getElementById('canvas');
    const imageFile = images[currentIndex];

    canvas.src = `file://${imageFile.path}`;
    canvas.alt = `Review image: ${imageFile.name}`;

    updateCardCounter();
    renderQuestions();
    updateNavigationButtons();
}

function updateCardCounter() {
    const counter = document.getElementById('cardCounter');
    if (images.length) {
        const responsesCount = Object.keys(answers).length;
        counter.textContent = `Card ${currentIndex + 1} of ${images.length} • ${responsesCount} cards with responses`;
    } else {
        counter.textContent = '';
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentIndex <= 0 || images.length === 0;
    nextBtn.disabled = currentIndex >= images.length - 1 || images.length === 0;
}

// ==========================
// QUESTION RENDERING
// ==========================
function renderQuestions() {
    const options = document.getElementById('options');
    const key = getUniqueKey(currentIndex);

    options.innerHTML = '';

    questions.forEach((question, qIndex) => {
        const qrow = document.createElement('div');
        qrow.className = 'qrow';

        const qText = document.createElement('div');
        qText.textContent = question.text;
        qrow.appendChild(qText);

        if (question.type === 'radio') {
            const optionGroup = document.createElement('div');
            optionGroup.className = 'optionGroup';

            question.options.forEach((option, oIndex) => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `q${qIndex}`;
                radio.value = option;
                radio.id = `q${qIndex}_${oIndex}`;

                const savedAnswer = getAnswer(key, qIndex);
                if (savedAnswer === option) {
                    radio.checked = true;
                    label.classList.add('selected');
                }

                radio.addEventListener('change', () => {
                    if (radio.checked) {
                        saveAnswer(key, qIndex, option);
                        optionGroup.querySelectorAll('label').forEach(l => l.classList.remove('selected'));
                        label.classList.add('selected');
                    }
                });

                label.appendChild(radio);
                label.appendChild(document.createTextNode(option));
                optionGroup.appendChild(label);
            });

            qrow.appendChild(optionGroup);
        }

        else if (question.type === 'checkbox') {
            const optionGroup = document.createElement('div');
            optionGroup.className = 'optionGroup';
            const savedAnswers = getAnswer(key, qIndex) || [];

            question.options.forEach((option, oIndex) => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = option;
                checkbox.id = `q${qIndex}_${oIndex}`;

                if (savedAnswers.includes(option)) {
                    checkbox.checked = true;
                    label.classList.add('selected');
                }

                checkbox.addEventListener('change', () => {
                    const currentAnswers = getAnswer(key, qIndex) || [];
                    if (checkbox.checked) {
                        if (!currentAnswers.includes(option)) {
                            currentAnswers.push(option);
                        }
                        label.classList.add('selected');
                    } else {
                        const index = currentAnswers.indexOf(option);
                        if (index > -1) {
                            currentAnswers.splice(index, 1);
                        }
                        label.classList.remove('selected');
                    }
                    saveAnswer(key, qIndex, currentAnswers);
                });

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(option));
                optionGroup.appendChild(label);
            });

            qrow.appendChild(optionGroup);
        }

        else if (question.type === 'text') {
            const textarea = document.createElement('textarea');
            textarea.placeholder = 'Enter your response here...';
            textarea.value = getAnswer(key, qIndex) || '';
            textarea.rows = 2; // Sets the default height to two lines
            adjustTextareaHeight(textarea);

            textarea.addEventListener('input', () => {
                saveAnswer(key, qIndex, textarea.value);
                adjustTextareaHeight(textarea);
            });

            qrow.appendChild(textarea);
        }

        options.appendChild(qrow);
    });
}

// ==========================
// EVENT LISTENERS
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    loadFilesOnStartup();

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    function updateThemeToggleIcon() {
        if (htmlElement.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
            themeToggle.setAttribute('aria-label', 'Toggle light mode');
            themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            themeToggle.textContent = '🌙';
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
            themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    }

    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark-mode');
        updateThemeToggleIcon();
    });

    // Initial check for theme icon
    updateThemeToggleIcon();

    // Navigation Buttons
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            showImage();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            showImage();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
            return;
        }
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            currentIndex--;
            showImage();
        } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
            currentIndex++;
            showImage();
        }
    });

    // Zoom Controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        zoom = Math.min(zoom * 1.2, 5);
        document.getElementById('canvas').style.transform = `scale(${zoom})`;
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        zoom = Math.max(zoom / 1.2, 0.1);
        document.getElementById('canvas').style.transform = `scale(${zoom})`;
    });

    document.getElementById('fitScreen').addEventListener('click', () => {
        zoom = 1;
        document.getElementById('canvas').style.transform = 'scale(1)';
    });

    // Help Toggle
    document.getElementById('helpToggle').addEventListener('click', () => {
        const helpText = document.getElementById('helpText');
        const button = document.getElementById('helpToggle');
        helpText.classList.toggle('visible');
        const isVisible = helpText.classList.contains('visible');
        button.setAttribute('aria-expanded', isVisible);
    });

    // Clear Functions
    document.getElementById('clearCurrentBtn').addEventListener('click', () => {
        if (!confirm('Clear all responses for the current image?')) return;
        const key = getUniqueKey(currentIndex);
        if (answers[key]) {
            delete answers[key];
            renderQuestions();
            updateCardCounter();
        }
    });

    document.getElementById('clearAllBtn').addEventListener('click', () => {
        if (!confirm('Clear ALL responses for ALL images? This cannot be undone.')) return;
        answers = {};
        renderQuestions();
        updateCardCounter();
    });

    // Export Functions
    function imageToBase64(filePath) {
        try {
            const data = fs.readFileSync(filePath);
            const base64String = data.toString('base64');
            const mimeType = 'image/' + path.extname(filePath).slice(1);
            return `data:${mimeType};base64,${base64String}`;
        } catch (error) {
            console.error(`Error converting ${filePath} to Base64:`, error);
            return '';
        }
    }

    document.getElementById('exportHtml').addEventListener('click', () => {
        const exportButton = document.getElementById('exportHtml');
        const cardsWithResponses = Object.keys(answers).filter(key => Object.keys(answers[key]).length > 0);

        if (cardsWithResponses.length === 0) {
            alert('No responses to export. Please answer some questions first.');
            return;
        }

        exportButton.disabled = true;
        exportButton.textContent = 'Exporting...';

        try {
            const originalStyles = document.querySelector('link[rel="stylesheet"]').outerHTML;
            let htmlContent = `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>Card Review Results</title>
            ${originalStyles}
            <style>
            body { background-color: var(--bg-secondary); padding: 1rem; }
            .report-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); }
            .report-card { display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1.5rem; margin: 0 auto 2rem auto; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-primary); box-shadow: 0 4px 12px var(--shadow-light); max-width: 1400px; page-break-inside: avoid; }
            .report-card-image { flex: 1 1 40%; min-width: 300px; }
            .report-card-image img { max-width: 100%; height: auto; border-radius: 6px; border: 1px solid var(--border-color); }
            .report-card-responses { flex: 1 1 55%; min-width: 300px; }
            h2.filename { margin-top: 0; margin-bottom: 1rem; color: var(--accent-purple); font-size: 1.5rem; word-break: break-all; }
            @media print { .report-card-image, .report-card-responses { flex-basis: 50%; } }
            </style>
            </head>
            <body>
            <div class="report-header">
            <h1 class="topTitle">Card Review Results</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Total cards with responses: ${cardsWithResponses.length}</p>
            </div>`;

            for (const key of cardsWithResponses) {
                const parts = key.split(':::');
                const filePath = parts[1];
                const filename = path.basename(filePath);
                const imageUrl = imageToBase64(filePath);

                htmlContent += `
                <div class="report-card">
                <div class="report-card-image">
                <h2 class="filename">${filename}</h2>
                <img src="${imageUrl}" alt="${filename}">
                </div>
                <div class="report-card-responses">
                `;

                questions.forEach((question, qIndex) => {
                    const answer = getAnswer(key, qIndex);
                    htmlContent += `<div class="qrow"><div>${question.text}</div>`;
                    if (question.type === 'radio') {
                        htmlContent += `<div class="optionGroup">`;
                        question.options.forEach(option => {
                            const isChecked = (answer === option);
                            htmlContent += `<label class="${isChecked ? 'selected' : ''}">
                            <input type="radio" ${isChecked ? 'checked' : ''} disabled>
                            ${option}
                            </label>`;
                        });
                        htmlContent += `</div>`;
                    } else if (question.type === 'checkbox') {
                        htmlContent += `<div class="optionGroup">`;
                        const savedAnswers = answer || [];
                        question.options.forEach(option => {
                            const isChecked = savedAnswers.includes(option);
                            htmlContent += `<label class="${isChecked ? 'selected' : ''}">
                            <input type="checkbox" ${isChecked ? 'checked' : ''} disabled>
                            ${option}
                            </label>`;
                        });
                        htmlContent += `</div>`;
                    } else if (question.type === 'text') {
                        const textAnswer = answer || '';
                        htmlContent += `<textarea disabled>${textAnswer.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>`;
                    }
                    htmlContent += `</div>`;
                });
                htmlContent += `</div></div>`;
            }
            htmlContent += `</body></html>`;
            ipcRenderer.send('save-html-dialog', htmlContent);

        } catch (error) {
            console.error("Failed to generate HTML content:", error);
            alert("An error occurred during HTML generation. Please check the console for details.");
            exportButton.disabled = false;
            exportButton.textContent = 'Export Browser File';
        }
    });

    ipcRenderer.on('save-html-result', (event, result) => {
        const exportButton = document.getElementById('exportHtml');
        exportButton.disabled = false;
        exportButton.textContent = 'Export Browser File';
        if (result.success) {
            alert(`Export successful! File saved to: ${result.path}`);
        } else if (result.canceled) {
            console.log("Save dialog was canceled.");
        } else {
            alert("An error occurred during the export. Please check the console for details.");
            console.error("Failed to export HTML:", result.error);
        }
    });
});
