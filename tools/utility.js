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

function parseMarkdownLists(text) {
    // Split into lines, group contiguous list blocks, build nested <ul>
    const lines  = text.split('\n');
    const out    = [];
    let   i      = 0;

    const isBullet = line => /^(\s*)[*\-+] /.test(line);

    const buildList = (block) => {
        // block: array of {indent, text} objects
        const html  = [];
        let   j     = 0;
        while (j < block.length) {
            const { indent, text } = block[j];
            // Collect children (deeper indent)
            const children = [];
            j++;
            while (j < block.length && block[j].indent > indent) {
                children.push(block[j]);
                j++;
            }
            if (children.length > 0) {
                html.push(`<li>${text}${buildList(children)}</li>`);
            } else {
                html.push(`<li>${text}</li>`);
            }
        }
        return `<ul>${html.join('')}</ul>`;
    };

    while (i < lines.length) {
        if (isBullet(lines[i])) {
            // Collect all contiguous bullet lines (including blank lines between items)
            const block = [];
            while (i < lines.length && (isBullet(lines[i]) || (lines[i].trim() === '' && i + 1 < lines.length && isBullet(lines[i + 1])))) {
                if (lines[i].trim() === '') { i++; continue; }
                const m      = lines[i].match(/^(\s*)[*\-+] (.*)/);
                const indent = m[1].length;
                const text   = m[2];
                block.push({ indent, text });
                i++;
            }
            if (block.length > 0) out.push(buildList(block));
        } else {
            out.push(lines[i]);
            i++;
        }
    }

    return out.join('\n');
}

function parseMarkdown(src) {
    let html = src.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) => `<pre><code>${code.trimEnd()}</code></pre>`);

    for (let n = 6; n >= 1; n--)
        html = html.replace(new RegExp(`^#{${n}} (.+)$`, 'gm'), `<h${n}>$1</h${n}>`);

    html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Lists — handle indented sub-bullets recursively
    html = parseMarkdownLists(html);

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

// ── HTTP Status Codes ─────────────────────────────────────

const HTTP_STATUSES = [
    {
        group: '1xx Informational', color: '#6A8A9A', codes: [
            { code: 100, name: 'Continue',            desc: 'The server has received the request headers; the client should proceed to send the body.' },
            { code: 101, name: 'Switching Protocols',  desc: 'The requester has asked the server to switch protocols.' },
            { code: 102, name: 'Processing',           desc: 'The server has received and is processing the request, but no response is available yet.' },
            { code: 103, name: 'Early Hints',          desc: 'Used to return some response headers before final HTTP message.' },
        ]
    },
    {
        group: '2xx Success', color: '#3A6B4A', codes: [
            { code: 200, name: 'OK',                   desc: 'Standard successful response.' },
            { code: 201, name: 'Created',              desc: 'The request succeeded and a new resource was created.' },
            { code: 202, name: 'Accepted',             desc: 'The request has been accepted for processing, but processing is not complete.' },
            { code: 203, name: 'Non-Authoritative Info', desc: 'The response is from a transforming proxy, not the origin server.' },
            { code: 204, name: 'No Content',           desc: 'The server successfully processed the request but is not returning any content.' },
            { code: 205, name: 'Reset Content',        desc: 'Tells the client to reset the document view.' },
            { code: 206, name: 'Partial Content',      desc: 'The server is delivering only part of the resource (byte range).' },
            { code: 207, name: 'Multi-Status',         desc: 'Multiple independent operations (WebDAV).' },
            { code: 208, name: 'Already Reported',     desc: 'Members of a DAV binding have already been enumerated.' },
            { code: 226, name: 'IM Used',              desc: 'The server fulfilled a GET request using instance manipulations.' },
        ]
    },
    {
        group: '3xx Redirection', color: '#7A6A45', codes: [
            { code: 300, name: 'Multiple Choices',     desc: 'Multiple options for the resource; the user or browser should choose one.' },
            { code: 301, name: 'Moved Permanently',    desc: 'The URL has been permanently moved. Future requests should use the new URL.' },
            { code: 302, name: 'Found',                desc: 'Temporary redirect. The resource is temporarily under a different URL.' },
            { code: 303, name: 'See Other',            desc: 'The response to the request can be found under another URL (GET).' },
            { code: 304, name: 'Not Modified',         desc: 'The cached version is still valid; no need to retransmit.' },
            { code: 307, name: 'Temporary Redirect',   desc: 'Temporary redirect; the method and body are not changed.' },
            { code: 308, name: 'Permanent Redirect',   desc: 'Permanent redirect; the method and body are not changed.' },
        ]
    },
    {
        group: '4xx Client Errors', color: '#8B3030', codes: [
            { code: 400, name: 'Bad Request',          desc: 'The server cannot process the request due to malformed syntax.' },
            { code: 401, name: 'Unauthorized',         desc: 'Authentication is required and has failed or not been provided.' },
            { code: 402, name: 'Payment Required',     desc: 'Reserved for future use; sometimes used for digital payment.' },
            { code: 403, name: 'Forbidden',            desc: 'The client does not have access rights to the content.' },
            { code: 404, name: 'Not Found',            desc: 'The server cannot find the requested resource.' },
            { code: 405, name: 'Method Not Allowed',   desc: 'The request method is not supported for the requested resource.' },
            { code: 406, name: 'Not Acceptable',       desc: 'No content matching the Accept headers.' },
            { code: 407, name: 'Proxy Auth Required',  desc: 'The client must authenticate with the proxy.' },
            { code: 408, name: 'Request Timeout',      desc: 'The server timed out waiting for the request.' },
            { code: 409, name: 'Conflict',             desc: 'Request conflict with the current state of the server.' },
            { code: 410, name: 'Gone',                 desc: 'The resource has been permanently deleted and will not return.' },
            { code: 411, name: 'Length Required',      desc: 'Content-Length header is required.' },
            { code: 412, name: 'Precondition Failed',  desc: 'One or more conditions in the request header fields evaluated to false.' },
            { code: 413, name: 'Content Too Large',    desc: 'The request body is larger than the server is willing to process.' },
            { code: 414, name: 'URI Too Long',         desc: 'The URI provided is longer than the server is willing to process.' },
            { code: 415, name: 'Unsupported Media',    desc: 'The media format of the requested data is not supported.' },
            { code: 416, name: 'Range Not Satisfiable',desc: 'The requested range cannot be fulfilled.' },
            { code: 417, name: 'Expectation Failed',   desc: 'The Expect header cannot be met by the server.' },
            { code: 418, name: "I'm a Teapot",         desc: 'The server refuses to brew coffee because it is a teapot (RFC 2324).' },
            { code: 421, name: 'Misdirected Request',  desc: 'The request was directed at a server unable to produce a response.' },
            { code: 422, name: 'Unprocessable Content',desc: 'The request was well-formed but contains semantic errors.' },
            { code: 423, name: 'Locked',               desc: 'The resource is locked (WebDAV).' },
            { code: 424, name: 'Failed Dependency',    desc: 'The request failed due to failure of a previous request (WebDAV).' },
            { code: 425, name: 'Too Early',            desc: 'The server is unwilling to risk processing a replayed request.' },
            { code: 426, name: 'Upgrade Required',     desc: 'The client should switch to a different protocol.' },
            { code: 428, name: 'Precondition Required',desc: 'The server requires the request to be conditional.' },
            { code: 429, name: 'Too Many Requests',    desc: 'The client has sent too many requests in a given amount of time (rate limiting).' },
            { code: 431, name: 'Headers Too Large',    desc: 'The server is unwilling to process the request because its header fields are too large.' },
            { code: 444, name: 'No Response',          desc: 'Connection closed with no response sent. Used to deter malicious clients.', vendor: 'nginx' },
            { code: 451, name: 'Unavailable For Legal',desc: 'The resource is unavailable due to a legal demand.' },
            { code: 460, name: 'Client Closed',        desc: 'Client closed the connection before the load balancer could send a response.', vendor: 'AWS ALB' },
            { code: 463, name: 'X-Forwarded-For Too Long', desc: 'The X-Forwarded-For header has more than 30 IP addresses.', vendor: 'AWS ALB' },
            { code: 494, name: 'Request Header Too Large', desc: 'The request headers exceeded the configured buffer size.', vendor: 'nginx' },
            { code: 495, name: 'SSL Certificate Error',desc: 'Client SSL certificate verification failed.', vendor: 'nginx' },
            { code: 496, name: 'SSL Certificate Required', desc: 'Client did not provide an SSL certificate when one was required.', vendor: 'nginx' },
            { code: 497, name: 'HTTP → HTTPS',         desc: 'Plain HTTP request sent to an HTTPS port.', vendor: 'nginx' },
            { code: 499, name: 'Client Closed Request',desc: 'Client closed the connection before the server finished sending the response.', vendor: 'nginx' },
        ]
    },
    {
        group: '5xx Server Errors', color: '#6B5C70', codes: [
            { code: 500, name: 'Internal Server Error',desc: 'A generic error when the server encounters an unexpected condition.' },
            { code: 501, name: 'Not Implemented',      desc: 'The server does not support the functionality required to fulfil the request.' },
            { code: 502, name: 'Bad Gateway',          desc: 'The server received an invalid response from an upstream server.' },
            { code: 503, name: 'Service Unavailable',  desc: 'The server is not ready to handle the request (down for maintenance or overloaded).' },
            { code: 504, name: 'Gateway Timeout',      desc: 'The server did not get a response in time from the upstream server.' },
            { code: 505, name: 'HTTP Version Not Supported', desc: 'The HTTP version used in the request is not supported.' },
            { code: 506, name: 'Variant Also Negotiates', desc: 'Transparent content negotiation results in a circular reference.' },
            { code: 507, name: 'Insufficient Storage', desc: 'The server is unable to store the representation needed (WebDAV).' },
            { code: 508, name: 'Loop Detected',        desc: 'The server detected an infinite loop while processing the request (WebDAV).' },
            { code: 509, name: 'Bandwidth Limit Exceeded', desc: 'The server has exceeded its bandwidth quota for the period.', vendor: 'Apache/cPanel' },
            { code: 510, name: 'Not Extended',         desc: 'Further extensions to the request are required.' },
            { code: 511, name: 'Network Auth Required',desc: 'The client needs to authenticate to gain network access.' },
            { code: 520, name: 'Web Server Unknown Error', desc: 'Origin server returned an unexpected response.', vendor: 'Cloudflare' },
            { code: 521, name: 'Web Server Down',      desc: 'Origin server refused the connection.', vendor: 'Cloudflare' },
            { code: 522, name: 'Connection Timed Out', desc: 'Could not connect to the origin server in time.', vendor: 'Cloudflare' },
            { code: 523, name: 'Origin Unreachable',   desc: 'Cannot reach the origin server.', vendor: 'Cloudflare' },
            { code: 524, name: 'A Timeout Occurred',   desc: 'Connected to origin but it did not reply in time.', vendor: 'Cloudflare' },
            { code: 525, name: 'SSL Handshake Failed', desc: 'SSL handshake between proxy and origin server failed.', vendor: 'Cloudflare' },
            { code: 526, name: 'Invalid SSL Certificate', desc: 'Origin SSL certificate could not be validated.', vendor: 'Cloudflare' },
            { code: 527, name: 'Railgun Error',        desc: 'Timeout or error with the Railgun WAN optimisation plugin.', vendor: 'Cloudflare' },
            { code: 530, name: 'Origin DNS Error',     desc: 'DNS resolution of the origin host failed.', vendor: 'Cloudflare' },
            { code: 598, name: 'Network Read Timeout', desc: 'Network read timeout behind the proxy.', vendor: 'Proxy' },
            { code: 599, name: 'Network Connect Timeout', desc: 'Network connect timeout behind the proxy.', vendor: 'Proxy' },
        ]
    },
];

function httpStatusRender(filter = '') {
    const listEl = document.getElementById('http-status-list');
    if (!listEl) return;

    const q = filter.trim().toLowerCase();
    let anyVisible = false;
    let html = '<div style="display:flex;flex-direction:column;gap:8px;">';

    HTTP_STATUSES.forEach((group, gi) => {
        const rows = group.codes.filter(c =>
            !q ||
            String(c.code).includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.desc.toLowerCase().includes(q) ||
            (c.vendor && c.vendor.toLowerCase().includes(q))
        );
        if (rows.length === 0) return;
        anyVisible = true;

        const isOpen = q || gi === 0;
        html += `
        <div class="http-status-group${isOpen ? ' open' : ''}" id="http-group-${gi}">
            <button class="http-status-group-header" onclick="httpStatusToggle(${gi})">
                <span class="http-status-group-toggle">▶</span>
                ${escapeHtml(group.group)}
                <span class="http-status-group-badge" style="background:${group.color}">${rows.length}</span>
            </button>
            <div class="http-status-rows">
                ${rows.map(c => `
                <div class="http-status-row${c.vendor ? ' http-status-row-vendor' : ''}">
                    <span class="http-status-code" style="color:${c.vendor ? '#7A7A7A' : group.color}">${c.code}</span>
                    <span class="http-status-name">${escapeHtml(c.name)}${c.vendor ? ` <span class="http-vendor-tag">${escapeHtml(c.vendor)}</span>` : ''}</span>
                    <span class="http-status-desc">${escapeHtml(c.desc)}</span>
                </div>`).join('')}
            </div>
        </div>`;
    });

    if (!anyVisible) {
        html += `<div class="http-status-no-results">No matching status codes.</div>`;
    }

    html += '</div>';
    listEl.innerHTML = html;
}

function httpStatusToggle(gi) {
    const el = document.getElementById(`http-group-${gi}`);
    if (el) el.classList.toggle('open');
}

function httpStatusFilter() {
    const q = document.getElementById('http-status-search').value;
    httpStatusRender(q);
}

// ── Pomodoro Timer ────────────────────────────────────────

const POMO_SESSIONS = 4; // dots shown per cycle

let pomoState = {
    workMins:  25,
    breakMins: 5,
    secsLeft:  25 * 60,
    isWork:    true,
    running:   false,
    session:   1,
    timer:     null,
};

function pomoSelectMode(btn) {
    document.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    pomoState.workMins  = parseInt(btn.dataset.work);
    pomoState.breakMins = parseInt(btn.dataset.break);
    pomoReset();
}

function pomoToggle() {
    if (pomoState.running) {
        pomoState.running = false;
        clearInterval(pomoState.timer);
        document.getElementById('pomo-start-btn').textContent = 'Resume';
        document.getElementById('pomo-start-btn').classList.remove('running');
    } else {
        pomoState.running = true;
        document.getElementById('pomo-start-btn').textContent = 'Pause';
        document.getElementById('pomo-start-btn').classList.add('running');
        pomoState.timer = setInterval(pomoTick, 1000);
    }
}

function pomoTick() {
    if (pomoState.secsLeft > 0) {
        pomoState.secsLeft--;
        pomoUpdateDisplay();
    } else {
        // Session complete
        clearInterval(pomoState.timer);
        pomoState.running = false;
        pomoRing();

        if (pomoState.isWork) {
            // Switch to break
            pomoState.isWork  = false;
            pomoState.secsLeft = pomoState.breakMins * 60;
        } else {
            // Break done — next work session
            pomoState.isWork   = true;
            pomoState.session  = (pomoState.session % POMO_SESSIONS) + 1;
            pomoState.secsLeft = pomoState.workMins * 60;
        }
        pomoUpdateDisplay();
        // Auto-start next phase
        document.getElementById('pomo-start-btn').textContent = 'Start';
        document.getElementById('pomo-start-btn').classList.remove('running');
    }
}

function pomoReset() {
    clearInterval(pomoState.timer);
    pomoState.running  = false;
    pomoState.isWork   = true;
    pomoState.session  = 1;
    pomoState.secsLeft = pomoState.workMins * 60;
    const btn = document.getElementById('pomo-start-btn');
    if (btn) { btn.textContent = 'Start'; btn.classList.remove('running'); }
    pomoUpdateDisplay();
}

function pomoSkip() {
    clearInterval(pomoState.timer);
    pomoState.running = false;
    pomoState.secsLeft = 0;
    const btn = document.getElementById('pomo-start-btn');
    if (btn) { btn.textContent = 'Start'; btn.classList.remove('running'); }
    pomoTick(); // trigger the phase transition
}

function pomoUpdateDisplay() {
    const mins = Math.floor(pomoState.secsLeft / 60).toString().padStart(2, '0');
    const secs = (pomoState.secsLeft % 60).toString().padStart(2, '0');

    const timeEl    = document.getElementById('pomo-time');
    const phaseEl   = document.getElementById('pomo-phase');
    const sessionEl = document.getElementById('pomo-session');
    const ringFill  = document.getElementById('pomo-ring-fill');
    const dotsEl    = document.getElementById('pomo-dots');
    if (!timeEl) return;

    timeEl.textContent    = `${mins}:${secs}`;
    phaseEl.textContent   = pomoState.isWork ? 'Work' : 'Break';
    phaseEl.className     = 'pomo-phase' + (pomoState.isWork ? '' : ' break');
    sessionEl.textContent = `Session ${pomoState.session} of ${POMO_SESSIONS}`;

    // Progress ring: circumference = 2π×52 ≈ 327
    const total    = (pomoState.isWork ? pomoState.workMins : pomoState.breakMins) * 60;
    const progress = pomoState.secsLeft / total;
    ringFill.style.strokeDashoffset = 327 * progress;
    ringFill.className = 'pomo-ring-fill' + (pomoState.isWork ? '' : ' break');

    // Session dots
    let dotsHtml = '';
    for (let i = 1; i <= POMO_SESSIONS; i++) {
        const done    = i < pomoState.session || (!pomoState.isWork && i === pomoState.session);
        const current = i === pomoState.session && pomoState.isWork;
        dotsHtml += `<div class="pomo-dot${done ? ' done' : ''}${current ? ' current' : ''}"></div>`;
    }
    dotsEl.innerHTML = dotsHtml;
}

function pomoRing() {
    if (!document.getElementById('pomo-sound')?.checked) return;

    // Generate a pleasant two-tone chime using Web Audio API
    try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const play = (freq, startAt, dur) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type      = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
            gain.gain.setValueAtTime(0.4, ctx.currentTime + startAt);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + dur);
            osc.start(ctx.currentTime + startAt);
            osc.stop(ctx.currentTime + startAt + dur);
        };
        play(660, 0,    0.4);
        play(880, 0.45, 0.5);
    } catch (e) {
        // Audio not available — silently skip
    }
}

// Initialise display when panel is activated
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (btn.getAttribute('data-tool') === 'pomodoro') {
            btn.addEventListener('click', pomoUpdateDisplay);
        }
    });
    pomoUpdateDisplay();
});

// ── To-Do List ────────────────────────────────────────────

const TODO_KEY = 'onedevtools_todos';

function todoLoad() {
    try { return JSON.parse(localStorage.getItem(TODO_KEY)) || []; }
    catch { return []; }
}

function todoSave(items) {
    localStorage.setItem(TODO_KEY, JSON.stringify(items));
}

function todoRender() {
    const items    = todoLoad();
    const listEl   = document.getElementById('todo-items');
    const footerEl = document.getElementById('todo-footer');
    if (!listEl) return;

    if (items.length === 0) {
        listEl.innerHTML = '<div class="todo-empty">No tasks yet. Add one above.</div>';
        footerEl.textContent = '';
        return;
    }

    listEl.innerHTML = items.map((item, i) => `
        <li class="todo-item${item.done ? ' done' : ''}"
            tabindex="0"
            data-index="${i}"
            onkeydown="todoKeydown(event, ${i})"
            ondblclick="todoStartEdit(${i})"
            onclick="todoToggle(${i})">
            <span class="todo-check">${item.done ? '✓' : ''}</span>
            <span class="todo-text">${escapeHtml(item.text).replace(/\n/g, '<br>')}</span>
            <button class="todo-delete" title="Delete" onclick="event.stopPropagation(); todoDelete(${i})">×</button>
        </li>
    `).join('');

    const done  = items.filter(t => t.done).length;
    const total = items.length;
    footerEl.textContent = `${done} of ${total} done`;
}

function todoAdd() {
    const input = document.getElementById('todo-input');
    const text  = input.value.trim();
    if (!text) return;
    const items = todoLoad();
    items.push({ text, done: false });
    todoSave(items);
    input.value = '';
    input.style.height = '';
    todoRender();
}

function todoToggle(index) {
    // Don't toggle while editing
    if (document.querySelector('.todo-item-edit')) return;
    const items = todoLoad();
    if (!items[index]) return;
    items[index].done = !items[index].done;
    todoSave(items);
    todoRender();
    const el = document.querySelector(`.todo-item[data-index="${index}"]`);
    if (el) el.focus();
}

function todoDelete(index) {
    const items = todoLoad();
    items.splice(index, 1);
    todoSave(items);
    todoRender();
    const next = document.querySelector(`.todo-item[data-index="${index}"]`)
               || document.querySelector(`.todo-item[data-index="${index - 1}"]`);
    if (next) next.focus();
    else document.getElementById('todo-input').focus();
}

function todoStartEdit(index) {
    const items = todoLoad();
    if (!items[index]) return;

    const li = document.querySelector(`.todo-item[data-index="${index}"]`);
    if (!li) return;

    // Replace item content with an inline textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'todo-item-edit';
    textarea.value = items[index].text;
    textarea.rows  = Math.max(1, items[index].text.split('\n').length);

    li.innerHTML = '';
    li.appendChild(textarea);
    li.onclick = null;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    const commit = () => {
        const newText = textarea.value.trim();
        if (newText) items[index].text = newText;
        todoSave(items);
        todoRender();
        const el = document.querySelector(`.todo-item[data-index="${index}"]`);
        if (el) el.focus();
    };

    textarea.addEventListener('blur', commit);
    textarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
        if (e.key === 'Escape') { todoRender(); }
    });
}

function todoKeydown(e, index) {
    // Don't intercept keys while an edit textarea is active
    if (e.target.tagName === 'TEXTAREA') return;
    if (e.key === ' ')                                  { e.preventDefault(); todoToggle(index); }
    if (e.key === 'Enter')                              { e.preventDefault(); todoToggle(index); }
    if (e.key === 'Delete' || e.key === 'Backspace')    { e.preventDefault(); todoDelete(index); }
    if (e.key === 'ArrowDown')                          { e.preventDefault(); focusTodoItem(index + 1); }
    if (e.key === 'ArrowUp')                            { e.preventDefault(); focusTodoItem(index - 1); }
    if (e.key === 'F2')                                 { e.preventDefault(); todoStartEdit(index); }
}

function focusTodoItem(index) {
    const el = document.querySelector(`.todo-item[data-index="${index}"]`);
    if (el) el.focus();
}

// Wire up input and render on panel activation
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('todo-input');
    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); todoAdd(); }
        });
        // Auto-grow textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        });
    }

    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (btn.getAttribute('data-tool') === 'todo-list')   btn.addEventListener('click', todoRender);
        if (btn.getAttribute('data-tool') === 'http-status') btn.addEventListener('click', () => httpStatusRender(document.getElementById('http-status-search')?.value || ''));
    });

    todoRender();
    httpStatusRender();
});
