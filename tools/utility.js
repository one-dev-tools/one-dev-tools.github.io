// ── Text Compare ──────────────────────────────────────────

function computeLineDiff(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m+1 }, () => new Array(n+1).fill(0));
    for (let i = m-1; i >= 0; i--)
        for (let j = n-1; j >= 0; j--)
            dp[i][j] = a[i] === b[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j], dp[i][j+1]);
    const result = [];
    let i = 0, j = 0;
    while (i < m || j < n) {
        if (i < m && j < n && a[i] === b[j])              { result.push({ type:'eq',  text: a[i] }); i++; j++; }
        else if (j < n && (i >= m || dp[i][j+1] >= dp[i+1][j])) { result.push({ type:'add', text: b[j] }); j++; }
        else                                                { result.push({ type:'del', text: a[i] }); i++; }
    }
    return result;
}

function diffLineHTML(type, numA, numB, text) {
    const num     = type === 'added' ? numB : numA;
    const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<div class="diff-line ${type}"><span class="diff-line-num">${num}</span><span class="diff-line-content">${escaped}</span></div>`;
}

function compareTexts() {
    const a         = document.getElementById('compare-input-a').value;
    const b         = document.getElementById('compare-input-b').value;
    const summaryEl = document.getElementById('diff-summary');
    const outputEl  = document.getElementById('diff-output');
    const linesA    = a.split('\n');
    const linesB    = b.split('\n');
    const diff      = computeLineDiff(linesA, linesB);

    let added = 0, removed = 0;
    diff.forEach(d => { if (d.type==='add') added++; else if (d.type==='del') removed++; });

    if (added === 0 && removed === 0) {
        summaryEl.innerHTML = '';
        outputEl.innerHTML  = linesA.map((line, i) => diffLineHTML('identical', i+1, i+1, line)).join('');
        return;
    }

    summaryEl.innerHTML =
        `<span class="diff-stat-add">+${added} addition${added!==1?'s':''}</span>` +
        `&ensp;<span class="diff-stat-del">−${removed} deletion${removed!==1?'s':''}</span>`;

    const CONTEXT = 3;
    const changed  = new Set();
    diff.forEach((d, i) => {
        if (d.type !== 'eq') for (let j = Math.max(0,i-CONTEXT); j <= Math.min(diff.length-1,i+CONTEXT); j++) changed.add(j);
    });

    let html = '', lineA = 1, lineB = 1, skipping = false;
    diff.forEach((d, i) => {
        if (!changed.has(i)) {
            if (!skipping) { html += `<div class="diff-separator">⋯ unchanged</div>`; skipping = true; }
            if (d.type === 'eq') { lineA++; lineB++; }
            return;
        }
        skipping = false;
        if      (d.type === 'eq')  { html += diffLineHTML('equal',   lineA, lineB, d.text); lineA++; lineB++; }
        else if (d.type === 'del') { html += diffLineHTML('removed',  lineA, '',    d.text); lineA++; }
        else                       { html += diffLineHTML('added',    '',    lineB, d.text); lineB++; }
    });
    outputEl.innerHTML = html;
}

function clearCompare() {
    ['compare-input-a','compare-input-b'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('diff-summary').innerHTML = '';
    document.getElementById('diff-output').innerHTML  = '';
}

// ── String Case Converter ─────────────────────────────────

function toWords(input) {
    return input
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0);
}

function convertAllCases() {
    const words = toWords(document.getElementById('string-case-input').value);
    if (words.length === 0) {
        ['camel','pascal','snake','kebab','constant','lower','upper','title'].forEach(id => {
            document.getElementById(`case-${id}`).value = '';
        });
        return;
    }
    const cap = w => w[0].toUpperCase() + w.slice(1);
    document.getElementById('case-camel').value    = words[0] + words.slice(1).map(cap).join('');
    document.getElementById('case-pascal').value   = words.map(cap).join('');
    document.getElementById('case-snake').value    = words.join('_');
    document.getElementById('case-kebab').value    = words.join('-');
    document.getElementById('case-constant').value = words.join('_').toUpperCase();
    document.getElementById('case-lower').value    = words.join(' ');
    document.getElementById('case-upper').value    = words.join(' ').toUpperCase();
    document.getElementById('case-title').value    = words.map(cap).join(' ');
}

// ── Regex Tester ──────────────────────────────────────────

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function runRegex() {
    const patternVal = document.getElementById('regex-pattern').value;
    const flagsVal   = document.getElementById('regex-flags').value.trim();
    const input      = document.getElementById('regex-input').value;
    const errorEl    = document.getElementById('regex-pattern-error');
    const matchPanel = document.getElementById('regex-match-panel');
    const hlEl       = document.getElementById('regex-highlighted');

    if (!patternVal) {
        errorEl.textContent = ''; errorEl.className = 'validation-message';
        matchPanel.innerHTML = '<div class="regex-empty">Enter a pattern and test string to see matches.</div>';
        hlEl.innerHTML = '';
        return;
    }

    let regex;
    try {
        regex = new RegExp(patternVal, flagsVal);
        errorEl.textContent = ''; errorEl.className = 'validation-message';
    } catch (e) {
        errorEl.textContent = '✗ ' + e.message; errorEl.className = 'validation-message error';
        matchPanel.innerHTML = ''; hlEl.innerHTML = '';
        return;
    }

    if (!input) {
        matchPanel.innerHTML = '<div class="regex-empty">Enter a test string to see matches.</div>';
        hlEl.innerHTML = '';
        return;
    }

    const isGlobal = flagsVal.includes('g') || flagsVal.includes('y');
    const matches  = [];
    if (isGlobal) {
        let m; regex.lastIndex = 0;
        while ((m = regex.exec(input)) !== null) {
            matches.push(m);
            if (m[0].length === 0) regex.lastIndex++;
        }
    } else {
        const m = regex.exec(input); if (m) matches.push(m);
    }

    if (matches.length === 0) {
        matchPanel.innerHTML = '<div class="regex-no-match">No matches found.</div>';
        hlEl.innerHTML = '';
        return;
    }

    const total = matches.length;
    matchPanel.innerHTML = matches.map((m, i) => {
        const groups     = m.slice(1);
        const groupsHtml = groups.length
            ? `<div class="regex-match-groups">${groups.map((g,gi) =>
                `Group ${gi+1}: <strong>${g===undefined?'<em>undefined</em>':escapeHtml(g)}</strong>`
              ).join(' &nbsp;·&nbsp; ')}</div>` : '';
        return `<div class="regex-match-item">
            <div class="regex-match-header">
                <span>Match <strong>${i+1} / ${total}</strong></span>
                <span>index <strong>${m.index}</strong></span>
                <span>length <strong>${m[0].length}</strong></span>
            </div>
            <div class="regex-match-value">${escapeHtml(m[0])}</div>
            ${groupsHtml}
        </div>`;
    }).join('');

    let highlighted = '', lastIndex = 0;
    matches.forEach(m => {
        highlighted += escapeHtml(input.slice(lastIndex, m.index));
        highlighted += `<mark class="regex-hl">${escapeHtml(m[0])}</mark>`;
        lastIndex = m.index + m[0].length;
    });
    highlighted += escapeHtml(input.slice(lastIndex));
    hlEl.innerHTML = highlighted;
}

// ── Markdown Preview ──────────────────────────────────────

function renderMarkdown() {
    document.getElementById('markdown-output').innerHTML =
        parseMarkdown(document.getElementById('markdown-input').value);
}

function parseMarkdown(src) {
    let html = src.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) => `<pre><code>${code.trimEnd()}</code></pre>`);

    for (let n = 6; n >= 1; n--)
        html = html.replace(new RegExp(`^#{${n}} (.+)$`, 'gm'), `<h${n}>$1</h${n}>`);

    html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    html = html.replace(/(^[*\-+] .+(\n[*\-+] .+)*)/gm, match =>
        `<ul>${match.trim().split('\n').map(l=>`<li>${l.replace(/^[*\-+] /,'')}</li>`).join('')}</ul>`);

    html = html.replace(/(^\d+\. .+(\n\d+\. .+)*)/gm, match =>
        `<ol>${match.trim().split('\n').map(l=>`<li>${l.replace(/^\d+\. /,'')}</li>`).join('')}</ol>`);

    html = html.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, match => {
        const rows    = match.trim().split('\n');
        const headers = rows[0].split('|').filter(c=>c.trim()).map(c=>`<th>${c.trim()}</th>`).join('');
        const body    = rows.slice(2).map(row =>
            `<tr>${row.split('|').filter(c=>c.trim()).map(c=>`<td>${c.trim()}</td>`).join('')}</tr>`
        ).join('');
        return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    html = html.split(/\n{2,}/).map(block => {
        const t = block.trim();
        if (!t) return '';
        if (/^<(h[1-6]|ul|ol|li|pre|blockquote|table|hr)/.test(t)) return t;
        return `<p>${t.replace(/\n/g,'<br>')}</p>`;
    }).join('\n');

    return html;
}
