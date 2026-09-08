/**
 * code-animation.js
 * Character-by-character typing animation for Web & App Development sections
 * Types one character at a time with syntax highlighting, then deletes and loops
 */

(function () {
  const SNIPPETS = [
    [
      { tokens: [{ t:'keyword', v:'const' }, { t:'', v:' website ' }, { t:'punctuation', v:'=' }, { t:'', v:' ' }, { t:'keyword', v:'new' }, { t:'', v:' ' }, { t:'class', v:'GeniusStudio' }, { t:'punctuation', v:'();' }] },
      { tokens: [{ t:'comment', v:'// Building your digital presence' }] },
      { tokens: [{ t:'keyword', v:'await' }, { t:'fn', v:' website.design' }, { t:'punctuation', v:'({' }] },
      { tokens: [{ t:'', v:'  ' }, { t:'string', v:"style: 'premium'" }, { t:'punctuation', v:',' }] },
      { tokens: [{ t:'', v:'  ' }, { t:'string', v:"feel: 'world-class'" }, { t:'punctuation', v:',' }] },
      { tokens: [{ t:'punctuation', v:'});' }] },
    ],
    [
      { tokens: [{ t:'comment', v:'// Launching your app...' }] },
      { tokens: [{ t:'keyword', v:'function' }, { t:'fn', v:' launch' }, { t:'punctuation', v:'(app) {' }] },
      { tokens: [{ t:'', v:'  ' }, { t:'keyword', v:'return' }, { t:'fn', v:' deploy' }, { t:'punctuation', v:'(' }, { t:'class', v:'app' }, { t:'punctuation', v:')' }] },
      { tokens: [{ t:'', v:'    ' }, { t:'punctuation', v:'.' }, { t:'fn', v:'to' }, { t:'punctuation', v:'(' }, { t:'string', v:"'production'" }, { t:'punctuation', v:')' }] },
      { tokens: [{ t:'', v:'    ' }, { t:'punctuation', v:'.' }, { t:'fn', v:'scale' }, { t:'punctuation', v:'(' }, { t:'number', v:'Infinity' }, { t:'punctuation', v:');' }] },
      { tokens: [{ t:'punctuation', v:'}' }] },
    ],
    [
      { tokens: [{ t:'comment', v:'// Modern stack, zero compromise' }] },
      { tokens: [{ t:'keyword', v:'import' }, { t:'', v:' ' }, { t:'class', v:'React' }, { t:'', v:' ' }, { t:'keyword', v:'from' }, { t:'', v:' ' }, { t:'string', v:"'react'" }, { t:'punctuation', v:';' }] },
      { tokens: [{ t:'keyword', v:'import' }, { t:'', v:' ' }, { t:'class', v:'AI' }, { t:'', v:' ' }, { t:'keyword', v:'from' }, { t:'', v:' ' }, { t:'string', v:"'@genius/ai'" }, { t:'punctuation', v:';' }] },
      { tokens: [] },
      { tokens: [{ t:'keyword', v:'export' }, { t:'keyword', v:' default' }, { t:'fn', v:' App' }, { t:'punctuation', v:'() =>' }, { t:'punctuation', v:' <' }, { t:'class', v:'Future' }, { t:'punctuation', v:' />' }] },
    ],
  ];

  const HERO_SNIPPET = [
    { tokens: [{ t:'comment', v:'// genius-studio.config' }] },
    { tokens: [{ t:'keyword', v:'const' }, { t:'', v:' ' }, { t:'fn', v:'services' }, { t:'', v:' ' }, { t:'punctuation', v:'=' }, { t:'', v:' {' }] },
    { tokens: [{ t:'', v:'  software: ' }, { t:'string', v:'"Original Solutions"' }, { t:'punctuation', v:',' }] },
    { tokens: [{ t:'', v:'  design: ' }, { t:'string', v:'"Graphic & Motion"' }, { t:'punctuation', v:',' }] },
    { tokens: [{ t:'', v:'  web: ' }, { t:'string', v:'"Full-Stack Dev"' }, { t:'punctuation', v:',' }] },
    { tokens: [{ t:'', v:'  marketing: ' }, { t:'string', v:'"Social Media"' }, { t:'punctuation', v:',' }] },
    { tokens: [{ t:'', v:'  quality: ' }, { t:'accent', v:'Infinity' }, { t:'punctuation', v:',' }] },
    { tokens: [{ t:'punctuation', v:'};' }] },
    { tokens: [] },
    { tokens: [{ t:'keyword', v:'export default' }, { t:'', v:' ' }, { t:'fn', v:'services' }, { t:'punctuation', v:';' }] }
  ];

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function flattenSnippet(snippet) {
    const chars = [];
    snippet.forEach((line, lineIdx) => {
      line.tokens.forEach(tok => {
        for (let i = 0; i < tok.v.length; i++) {
          chars.push({ ch: tok.v[i], type: tok.t, line: lineIdx });
        }
      });
      if (lineIdx < snippet.length - 1) {
        chars.push({ ch: '\n', type: '', line: lineIdx });
      }
    });
    return chars;
  }

  function buildHTML(chars, count, hideLineNumbers = false) {
    const lines = [[]];
    let lineIdx = 0;
    for (let i = 0; i < count && i < chars.length; i++) {
      if (chars[i].ch === '\n') {
        lineIdx++;
        lines[lineIdx] = [];
      } else {
        lines[lineIdx].push(chars[i]);
      }
    }

    return lines.map((lineChars, idx) => {
      let html = '';
      let currentType = null;
      let buffer = '';

      lineChars.forEach(c => {
        if (c.type !== currentType) {
          if (buffer) html += wrapToken(currentType, buffer);
          currentType = c.type;
          buffer = c.ch;
        } else {
          buffer += c.ch;
        }
      });
      if (buffer) html += wrapToken(currentType, buffer);

      if (hideLineNumbers) {
        return `<div class="code-line"><span class="code-line__text">${html}</span></div>`;
      } else {
        return `<div class="code-line"><span class="code-line__num">${idx + 1}</span><span class="code-line__text">${html}</span></div>`;
      }
    }).join('');
  }

  function wrapToken(type, text) {
    const escaped = escHtml(text);
    if (type) return `<span class="code-token--${type}">${escaped}</span>`;
    return escaped;
  }

  function renderSnippet(container, snippetsArray, snippetIdx, hideLineNumbers = false) {
    const snippet = snippetsArray[snippetIdx % snippetsArray.length];
    const chars = flattenSnippet(snippet);
    const total = chars.length;
    let charIndex = 0;
    let phase = 'typing';

    function tick() {
      if (phase === 'typing') {
        if (charIndex <= total) {
          container.innerHTML = buildHTML(chars, charIndex, hideLineNumbers);
          appendCursor(container);
          charIndex++;
          const nextChar = chars[charIndex - 1];
          let delay = 55 + Math.random() * 35;
          if (nextChar && (nextChar.ch === ' ' || nextChar.ch === '\n')) delay = 25;
          if (nextChar && nextChar.type === 'comment') delay = 35 + Math.random() * 20;
          setTimeout(tick, delay);
        } else {
          phase = 'pause';
          setTimeout(tick, 3000);
        }
      } else if (phase === 'pause') {
        phase = 'deleting';
        tick();
      } else if (phase === 'deleting') {
        if (charIndex > 0) {
          charIndex--;
          container.innerHTML = buildHTML(chars, charIndex, hideLineNumbers);
          appendCursor(container);
          setTimeout(tick, 18 + Math.random() * 12);
        } else {
          container.innerHTML = '';
          setTimeout(() => renderSnippet(container, snippetsArray, snippetIdx + 1, hideLineNumbers), 600);
        }
      }
    }

    tick();
  }

  function appendCursor(container) {
    container.querySelectorAll('.code-cursor').forEach(c => c.remove());
    const allLines = container.querySelectorAll('.code-line');
    if (allLines.length > 0) {
      const lastLine = allLines[allLines.length - 1];
      const textSpan = lastLine.querySelector('.code-line__text');
      if (textSpan) {
        const cursor = document.createElement('span');
        cursor.className = 'code-cursor';
        textSpan.appendChild(cursor);
      }
    }
  }

  function initCodeAnimations() {
    // Normal code anims
    document.querySelectorAll('[data-code-anim]').forEach((container, i) => {
      setTimeout(() => renderSnippet(container, SNIPPETS, i, false), i * 800);
    });

    // Hero code anim
    document.querySelectorAll('[data-hero-code-anim]').forEach((container) => {
      // Hero snippet, no line numbers
      setTimeout(() => renderSnippet(container, [HERO_SNIPPET], 0, true), 300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeAnimations);
  } else {
    initCodeAnimations();
  }
})();
