// renderer.js — loads images/questions from src/, with nodeIntegration enabled

let images = [];
let questions = [];
let answers = {};
let currentIndex = 0;
let zoom = 1;

const fs = require('fs');
const path = require('path');
const url = require('url');
const { ipcRenderer } = require('electron');

function shuffle(array) {
  return array.map(x => [Math.random(), x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
}

function getUniqueKey(index) {
  const sep = ':::';
  return images.length ? `${index}${sep}${images[index].path}` : '';
}

function saveAnswer(key, qId, value) {
  if (!answers[key]) answers[key] = {};
  answers[key][qId] = value;
}
function getAnswer(key, qId) {
  return answers[key] ? answers[key][qId] : null;
}
function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
}

function showEmptyState(message) {
  const options = document.getElementById('options');
  const canvas = document.getElementById('canvas');
  if (canvas) {
    canvas.src = '';
    canvas.alt = 'No image loaded';
  }
  options.innerHTML = `
    <div class="empty-state">
      <h3>Files not found</h3>
      <p>${message}</p>
    </div>
  `;
  updateCardCounter();
  updateNavigationButtons();
}

// Load questions.json and images from src/
async function loadFilesOnStartup() {
  // In Electron renderers, __dirname points to the HTML folder (src/)
  // Our assets are in src/images and src/data/questions.json
  const baseDir = __dirname;
  const imagesPath = path.join(baseDir, 'images');
  const questionsPath = path.join(baseDir, 'data', 'questions.json');

  try {
    console.log('Asset paths:', { baseDir, imagesPath, questionsPath });

    // questions
    if (fs.existsSync(questionsPath)) {
      const txt = fs.readFileSync(questionsPath, 'utf8');
      questions = JSON.parse(txt);
      console.log('✅ Questions loaded');
    } else {
      showEmptyState('questions.json not found in src/data/');
      return;
    }

    // images
    if (fs.existsSync(imagesPath)) {
      const names = fs.readdirSync(imagesPath);
      images = names
        .filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f))
        .map(f => ({ name: f, path: path.join(imagesPath, f) }));
      if (images.length === 0) {
        showEmptyState('No valid images found in src/images/');
        return;
      }
      images = shuffle(images);
      console.log(`✅ ${images.length} images loaded`);
    } else {
      showEmptyState('src/images/ folder not found.');
      return;
    }

    // draw first
    showImage();
  } catch (err) {
    console.error('❌ loadFilesOnStartup error:', err);
    showEmptyState('Error while loading files. See console.');
  }
}

function showImage() {
  if (!images.length || !questions.length) {
    showEmptyState('Make sure src/images and src/data/questions.json exist.');
    return;
  }
  const canvas = document.getElementById('canvas');
  const imageFile = images[currentIndex];
  const href = url.pathToFileURL(imageFile.path).href; // Windows-safe file URL
  canvas.src = href;
  canvas.alt = `Review image: ${imageFile.name}`;

  updateCardCounter();
  renderQuestions();
  updateNavigationButtons();
}

function updateCardCounter() {
  const counter = document.getElementById('cardCounter');
  if (!counter) return;
  if (images.length) {
    const count = Object.keys(answers).length;
    counter.textContent = `Card ${currentIndex + 1} of ${images.length} • ${count} cards with responses`;
  } else {
    counter.textContent = '';
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = currentIndex <= 0 || images.length === 0;
  nextBtn.disabled = currentIndex >= images.length - 1 || images.length === 0;
}

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
      const group = document.createElement('div');
      group.className = 'optionGroup';
      question.options.forEach((opt, oIndex) => {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${qIndex}`;
        radio.value = opt;
        radio.id = `q${qIndex}_${oIndex}`;

        const saved = getAnswer(key, qIndex);
        if (saved === opt) {
          radio.checked = true;
          label.classList.add('selected');
        }

        radio.addEventListener('change', () => {
          if (radio.checked) {
            saveAnswer(key, qIndex, opt);
            group.querySelectorAll('label').forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');
          }
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(opt));
        group.appendChild(label);
      });
      qrow.appendChild(group);
    } else if (question.type === 'checkbox') {
      const group = document.createElement('div');
      group.className = 'optionGroup';
      const saved = getAnswer(key, qIndex) || [];
      question.options.forEach((opt, oIndex) => {
        const label = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = opt;
        cb.id = `q${qIndex}_${oIndex}`;

        if (saved.includes(opt)) {
          cb.checked = true;
          label.classList.add('selected');
        }

        cb.addEventListener('change', () => {
          const cur = getAnswer(key, qIndex) || [];
          if (cb.checked) {
            if (!cur.includes(opt)) cur.push(opt);
            label.classList.add('selected');
          } else {
            const i = cur.indexOf(opt);
            if (i > -1) cur.splice(i, 1);
            label.classList.remove('selected');
          }
          saveAnswer(key, qIndex, cur);
        });

        label.appendChild(cb);
        label.appendChild(document.createTextNode(opt));
        group.appendChild(label);
      });
      qrow.appendChild(group);
    } else if (question.type === 'text') {
      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Enter your response here...';
      textarea.value = getAnswer(key, qIndex) || '';
      textarea.rows = 2;
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

document.addEventListener('DOMContentLoaded', () => {
  loadFilesOnStartup();

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;
  function setIcon() {
    if (!themeToggle) return;
    if (htmlEl.classList.contains('dark-mode')) {
      themeToggle.textContent = '☀️';
      themeToggle.setAttribute('aria-label', 'Toggle light mode');
      themeToggle.setAttribute('title', 'Switch to light mode');
    } else {
      themeToggle.textContent = '🌙';
      themeToggle.setAttribute('aria-label', 'Toggle dark mode');
      themeToggle.setAttribute('title', 'Switch to dark mode');
    }
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      htmlEl.classList.toggle('dark-mode');
      setIcon();
    });
    setIcon();
  }

  // “i” Help toggle — explicit show/hide (no CSS dependency)
  const helpToggle = document.getElementById('helpToggle');
  const helpText = document.getElementById('helpText');
  if (helpToggle && helpText) {
    // start hidden
    helpText.style.display = 'none';
    helpToggle.setAttribute('aria-expanded', 'false');
    helpToggle.setAttribute('title', 'Show help');

    helpToggle.addEventListener('click', () => {
      const showing = helpText.style.display === 'block';
      const next = showing ? 'none' : 'block';
      helpText.style.display = next;
      const expanded = next === 'block';
      helpToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      helpToggle.setAttribute('title', expanded ? 'Hide help' : 'Show help');
    });
  }

  // Nav buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; showImage(); }
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentIndex < images.length - 1) { currentIndex++; showImage(); }
  });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; showImage(); }
    else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) { currentIndex++; showImage(); }
  });

  // Zoom
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  const fitScreen = document.getElementById('fitScreen');
  if (zoomIn) zoomIn.addEventListener('click', () => {
    zoom = Math.min(zoom * 1.2, 5);
    document.getElementById('canvas').style.transform = `scale(${zoom})`;
  });
  if (zoomOut) zoomOut.addEventListener('click', () => {
    zoom = Math.max(zoom / 1.2, 0.1);
    document.getElementById('canvas').style.transform = `scale(${zoom})`;
  });
  if (fitScreen) fitScreen.addEventListener('click', () => {
    zoom = 1;
    document.getElementById('canvas').style.transform = 'scale(1)';
  });

  // Clear buttons
  const clearCurrentBtn = document.getElementById('clearCurrentBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearCurrentBtn) clearCurrentBtn.addEventListener('click', () => {
    if (!confirm('Clear all responses for the current image?')) return;
    const key = getUniqueKey(currentIndex);
    if (answers[key]) delete answers[key];
    renderQuestions();
    updateCardCounter();
  });
  if (clearAllBtn) clearAllBtn.addEventListener('click', () => {
    if (!confirm('Clear ALL responses for ALL images?')) return;
    answers = {};
    renderQuestions();
    updateCardCounter();
  });

  // Export
  const exportBtn = document.getElementById('exportHtml');
  function imageToBase64(filePath) {
    try {
      const data = fs.readFileSync(filePath);
      const base64 = data.toString('base64');
      const ext = path.extname(filePath).slice(1);
      const mime = 'image/' + ext;
      return `data:${mime};base64,${base64}`;
    } catch {
      return '';
    }
  }
  if (exportBtn) exportBtn.addEventListener('click', () => {
    const cardsWithResponses = Object.keys(answers).filter(k => Object.keys(answers[k]).length > 0);
    if (cardsWithResponses.length === 0) {
      alert('No responses to export. Please answer some questions first.');
      return;
    }

    exportBtn.disabled = true;
    exportBtn.textContent = 'Exporting...';

    try {
      const originalStyles = document.querySelector('link[rel="stylesheet"]')?.outerHTML || '';
      let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Card Review Results</title>${originalStyles}
      <style>
      body { background-color: var(--bg-secondary); padding: 1rem; }
      .report-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); }
      .report-card { display: flex; gap: 1.5rem; padding: 1.5rem; margin: 0 auto 2rem auto; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-primary); max-width: 1400px; page-break-inside: avoid; }
      .report-card-image { flex: 1 1 40%; min-width: 300px; }
      .report-card-image img { max-width: 100%; height: auto; border-radius: 6px; border: 1px solid var(--border-color); }
      .report-card-responses { flex: 1 1 55%; min-width: 300px; }
      .report-card-responses .optionGroup { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .report-card-responses .optionGroup label.selected { background-color: #555c8f; border-color: #555c8f; color: white; }
      h2.filename { margin-top: 0; margin-bottom: 1rem; color: var(--accent-purple); font-size: 1.2rem; word-break: break-all; }
      @media print { .report-card-image, .report-card-responses { flex-basis: 50%; } }
      </style></head><body>
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

        html += `<div class="report-card">
          <div class="report-card-image">
            <h2 class="filename">${filename}</h2>
            <img src="${imageUrl}" alt="${filename}">
          </div>
          <div class="report-card-responses">`;

        questions.forEach((q, qIndex) => {
          const ans = getAnswer(key, qIndex);
          html += `<div class="qrow"><div>${q.text}</div>`;
          if (q.type === 'radio') {
            html += `<div class="optionGroup">`;
            q.options.forEach(opt => {
              const checked = (ans === opt);
              html += `<label class="${checked ? 'selected' : ''}">
                <input type="radio" ${checked ? 'checked' : ''} disabled>${opt}
              </label>`;
            });
            html += `</div>`;
          } else if (q.type === 'checkbox') {
            html += `<div class="optionGroup">`;
            const saved = ans || [];
            q.options.forEach(opt => {
              const checked = saved.includes(opt);
              html += `<label class="${checked ? 'selected' : ''}">
                <input type="checkbox" ${checked ? 'checked' : ''} disabled>${opt}
              </label>`;
            });
            html += `</div>`;
          } else if (q.type === 'text') {
            const textAns = ans || '';
            html += `<textarea disabled>${textAns.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>`;
          }
          html += `</div>`;
        });

        html += `</div></div>`;
      }

      html += `</body></html>`;

      const now = new Date();
      const date = now.toISOString().slice(0,10);
      const time = now.toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit'});
      const defaultPath = `CardReview_${date}_${time}.html`;

      ipcRenderer.send('save-html-dialog', { htmlContent: html, defaultPath });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed (see console).');
      const b = document.getElementById('exportHtml');
      if (b) { b.disabled = false; b.textContent = 'Export Browser File'; }
      return;
    }
  });

  ipcRenderer.on('save-html-result', (_event, result) => {
    const exportBtn2 = document.getElementById('exportHtml');
    if (exportBtn2) {
      exportBtn2.disabled = false;
      exportBtn2.textContent = 'Export Browser File';
    }
    if (result.success) {
      alert(`Export successful! Saved to: ${result.path}`);
    } else if (result.canceled) {
      console.log('Save dialog canceled.');
    } else {
      alert('Export error (see console).');
      console.error(result.error);
    }
  });
});
