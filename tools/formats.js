// ── JSON Formatter & Visualizer ───────────────────────────

function formatJSON() {
    const input      = document.getElementById('json-input').value;
    const indent     = parseInt(document.getElementById('json-indent').value) || 2;
    const validation = document.getElementById('json-validation');
    try {
        document.getElementById('json-output').value = JSON.stringify(JSON.parse(input), null, indent);
        validation.textContent = '✓ Valid JSON';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid JSON: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

function minifyJSON() {
    const input      = document.getElementById('json-input').value;
    const validation = document.getElementById('json-validation');
    try {
        document.getElementById('json-output').value = JSON.stringify(JSON.parse(input));
        validation.textContent = '✓ Valid JSON (Minified)';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid JSON: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

function validateJSON() {
    const input      = document.getElementById('json-input').value;
    const validation = document.getElementById('json-validation');
    try {
        JSON.parse(input);
        validation.textContent = '✓ Valid JSON';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid JSON: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

// JSON Visualizer
let currentJSONData = null;

function visualizeJSON() {
    const input      = document.getElementById('json-viz-input').value;
    const output     = document.getElementById('json-viz-output');
    const validation = document.getElementById('json-viz-validation');
    try {
        currentJSONData = JSON.parse(input);
        output.innerHTML = '';
        output.appendChild(createJSONTreeNode('root', currentJSONData, true, []));
        validation.textContent = '✓ Valid JSON — Click keys to expand/collapse, click values to edit';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid JSON: ' + e.message;
        validation.className   = 'validation-message error';
        output.innerHTML = '';
        currentJSONData = null;
    }
}

function getJSONType(value) {
    if (value === null)          return 'null';
    if (Array.isArray(value))    return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value; // string | number | boolean
}

function createJSONTreeNode(key, value, isRoot = false, path = []) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = isRoot ? 'json-tree-node root' : 'json-tree-node';
    const itemDiv = document.createElement('div');
    itemDiv.className = 'json-tree-item';
    const type = getJSONType(value);

    if (type === 'object' || type === 'array') {
        const toggle = document.createElement('span');
        toggle.className = 'json-tree-toggle';
        toggle.textContent = '▼';
        toggle.onclick = e => { e.stopPropagation(); toggleJSONNode(toggle); };
        itemDiv.appendChild(toggle);

        if (!isRoot) {
            const keySpan = document.createElement('span');
            keySpan.className = 'json-tree-key';
            keySpan.textContent = key;
            keySpan.onclick = e => { e.stopPropagation(); toggleJSONNode(toggle); };
            itemDiv.appendChild(keySpan);
            itemDiv.appendChild(document.createTextNode(': '));
        }

        const bracket = document.createElement('span');
        bracket.className = 'json-tree-bracket';
        bracket.textContent = type === 'array' ? '[' : '{';
        itemDiv.appendChild(bracket);

        const keys = type === 'array' ? value : Object.keys(value);
        const count = document.createElement('span');
        count.className = 'json-tree-count';
        count.textContent = type === 'array' ? `${keys.length} items` : `${keys.length} keys`;
        itemDiv.appendChild(count);
        nodeDiv.appendChild(itemDiv);

        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'json-tree-children';
        if (type === 'array') {
            value.forEach((item, i) => childrenDiv.appendChild(createJSONTreeNode(`[${i}]`, item, false, [...path, i])));
        } else {
            Object.keys(value).forEach(k => childrenDiv.appendChild(createJSONTreeNode(k, value[k], false, [...path, k])));
        }

        if (keys.length === 0) {
            const emptySpan = document.createElement('span');
            emptySpan.className = 'json-tree-empty';
            emptySpan.textContent = ' empty';
            itemDiv.appendChild(emptySpan);
        }

        nodeDiv.appendChild(childrenDiv);

        const closingDiv = document.createElement('div');
        closingDiv.className = 'json-tree-item';
        const closeBracket = document.createElement('span');
        closeBracket.className = 'json-tree-bracket';
        closeBracket.textContent = type === 'array' ? ']' : '}';
        closingDiv.appendChild(closeBracket);
        nodeDiv.appendChild(closingDiv);
    } else {
        if (!isRoot) {
            const keySpan = document.createElement('span');
            keySpan.className = 'json-tree-key';
            keySpan.textContent = key;
            itemDiv.appendChild(keySpan);
            itemDiv.appendChild(document.createTextNode(': '));
        }
        const valueSpan = document.createElement('span');
        valueSpan.className = `json-tree-value ${type} editable`;
        valueSpan.contentEditable = false;
        valueSpan.dataset.path = JSON.stringify(path);
        valueSpan.dataset.type = type;
        valueSpan.textContent = type === 'string' ? `"${value}"` : type === 'null' ? 'null' : String(value);
        valueSpan.onclick = e => { e.stopPropagation(); makeValueEditable(valueSpan); };
        itemDiv.appendChild(valueSpan);
        nodeDiv.appendChild(itemDiv);
    }
    return nodeDiv;
}

function makeValueEditable(valueSpan) {
    if (valueSpan.contentEditable === 'true') return;
    const originalValue = valueSpan.textContent;
    valueSpan.classList.add('editing');
    valueSpan.contentEditable = true;
    valueSpan.focus();
    const range = document.createRange();
    range.selectNodeContents(valueSpan);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const saveEdit = () => {
        valueSpan.classList.remove('editing');
        valueSpan.contentEditable = false;
        const newValue = valueSpan.textContent.trim();
        const type = valueSpan.dataset.type;
        const path = JSON.parse(valueSpan.dataset.path);
        try {
            let parsed;
            if (type === 'string') {
                parsed = newValue.replace(/^"|"$/g, '');
                valueSpan.textContent = `"${parsed}"`;
            } else if (type === 'number') {
                parsed = Number(newValue);
                if (isNaN(parsed)) throw new Error('Invalid number');
                valueSpan.textContent = String(parsed);
            } else if (type === 'boolean') {
                if (newValue !== 'true' && newValue !== 'false') throw new Error('Boolean must be true or false');
                parsed = newValue === 'true';
                valueSpan.textContent = String(parsed);
            } else if (type === 'null') {
                if (newValue !== 'null') throw new Error('Must be null');
                parsed = null;
                valueSpan.textContent = 'null';
            }
            updateJSONValue(path, parsed);
        } catch (e) {
            valueSpan.textContent = originalValue;
            showNotification('Invalid value: ' + e.message, 'error');
        }
    };

    valueSpan.onblur = saveEdit;
    valueSpan.onkeydown = e => {
        if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
        else if (e.key === 'Escape') {
            valueSpan.textContent = originalValue;
            valueSpan.classList.remove('editing');
            valueSpan.contentEditable = false;
            valueSpan.blur();
        }
    };
}

function updateJSONValue(path, newValue) {
    if (!currentJSONData) return;
    let obj = currentJSONData;
    for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
    if (path.length > 0) obj[path[path.length - 1]] = newValue;
    else currentJSONData = newValue;
}

function copyVisualizedJSON() {
    if (!currentJSONData) { showNotification('No JSON to copy. Please visualize JSON first.', 'error'); return; }
    navigator.clipboard.writeText(JSON.stringify(currentJSONData, null, 2))
        .then(() => showNotification('JSON copied to clipboard!', 'success'))
        .catch(() => showNotification('Failed to copy JSON', 'error'));
}

function toggleJSONNode(toggle) {
    const children = toggle.parentElement.parentElement.querySelector('.json-tree-children');
    if (children) {
        children.classList.toggle('collapsed');
        toggle.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
    }
}

function expandAllJSON() {
    document.querySelectorAll('#json-viz-output .json-tree-children').forEach(c => c.classList.remove('collapsed'));
    document.querySelectorAll('#json-viz-output .json-tree-toggle').forEach(t => t.textContent = '▼');
}

function collapseAllJSON() {
    document.querySelectorAll('#json-viz-output .json-tree-children').forEach(c => c.classList.add('collapsed'));
    document.querySelectorAll('#json-viz-output .json-tree-toggle').forEach(t => t.textContent = '▶');
}

// ── XML Formatter ─────────────────────────────────────────

function formatXML() {
    const input      = document.getElementById('xml-input').value;
    const indent     = parseInt(document.getElementById('xml-indent').value) || 2;
    const validation = document.getElementById('xml-validation');
    try {
        const doc = _parseXML(input);
        document.getElementById('xml-output').value = formatXMLString(doc, indent);
        validation.textContent = '✓ Valid XML';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid XML: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

function minifyXML() {
    const input      = document.getElementById('xml-input').value;
    const validation = document.getElementById('xml-validation');
    try {
        const doc = _parseXML(input);
        const minified = new XMLSerializer().serializeToString(doc).replace(/>\s+</g, '><').trim();
        document.getElementById('xml-output').value = minified;
        validation.textContent = '✓ Valid XML (Minified)';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid XML: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

function validateXML() {
    const input      = document.getElementById('xml-input').value;
    const validation = document.getElementById('xml-validation');
    try {
        _parseXML(input);
        validation.textContent = '✓ Valid XML';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid XML: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

function _parseXML(input) {
    const doc = new DOMParser().parseFromString(input, 'text/xml');
    const err = doc.querySelector('parsererror');
    if (err) throw new Error(err.textContent);
    return doc;
}

function formatXMLString(xmlDoc, indent) {
    const indentStr = ' '.repeat(indent);
    let xmlString   = new XMLSerializer().serializeToString(xmlDoc).replace(/>\s*</g, '><');
    let formatted   = '';
    let depth       = 0;

    xmlString.split(/(<[^>]+>)/g).forEach(part => {
        if (part.trim() === '') return;
        if (part.startsWith('</')) {
            depth--;
            formatted += '\n' + indentStr.repeat(depth) + part;
        } else if (part.startsWith('<')) {
            formatted += '\n' + indentStr.repeat(depth) + part;
            if (!part.startsWith('<?') && !part.startsWith('<!') && !part.endsWith('/>')) depth++;
        } else {
            formatted += '\n' + indentStr.repeat(depth) + part.trim();
        }
    });
    return formatted.trim();
}

// ── YAML Formatter ────────────────────────────────────────

function formatYAML() {
    const input      = document.getElementById('yaml-input').value;
    const indent     = parseInt(document.getElementById('yaml-indent').value) || 2;
    const validation = document.getElementById('yaml-validation');
    try {
        document.getElementById('yaml-output').value = jsyaml.dump(jsyaml.load(input), { indent });
        validation.textContent = '✓ Valid YAML';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid YAML: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

function validateYAML() {
    const input      = document.getElementById('yaml-input').value;
    const validation = document.getElementById('yaml-validation');
    try {
        jsyaml.load(input);
        validation.textContent = '✓ Valid YAML';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid YAML: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

// ── YAML ↔ JSON ───────────────────────────────────────────

// Pure logic — testable
function yamlToJSONLogic(yamlStr, indent = 2) {
    const parsed = jsyaml.load(yamlStr);
    return JSON.stringify(parsed, null, indent);
}

function jsonToYAMLLogic(jsonStr, indent = 2) {
    return jsyaml.dump(JSON.parse(jsonStr), { indent });
}

function convertYAMLtoJSON() {
    const input      = document.getElementById('yaml-to-json-input').value;
    const indent     = parseInt(document.getElementById('yaml-to-json-indent').value) || 2;
    const validation = document.getElementById('yaml-to-json-validation');
    try {
        document.getElementById('yaml-to-json-output').value = yamlToJSONLogic(input, indent);
        validation.textContent = '✓ Converted successfully';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid YAML: ' + e.message;
        validation.className   = 'validation-message error';
        document.getElementById('yaml-to-json-output').value = '';
    }
}

function convertJSONtoYAML() {
    const input      = document.getElementById('json-to-yaml-input').value;
    const indent     = parseInt(document.getElementById('json-to-yaml-indent').value) || 2;
    const validation = document.getElementById('json-to-yaml-validation');
    try {
        document.getElementById('json-to-yaml-output').value = jsonToYAMLLogic(input, indent);
        validation.textContent = '✓ Converted successfully';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid JSON: ' + e.message;
        validation.className   = 'validation-message error';
        document.getElementById('json-to-yaml-output').value = '';
    }
}

// ── JSON ↔ CSV ────────────────────────────────────────────

// Pure logic — testable
function csvEscape(val) {
    const str = val === null || val === undefined ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
}

function jsonToCSVLogic(jsonStr) {
    const parsed = JSON.parse(jsonStr);
    const rows   = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0 || typeof rows[0] !== 'object' || rows[0] === null)
        throw new Error('Input must be a JSON array of objects');
    const headers = Array.from(rows.reduce((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set()));
    return [
        headers.map(csvEscape).join(','),
        ...rows.map(row => headers.map(h => csvEscape(row[h])).join(','))
    ].join('\n');
}

function parseCSVLine(line) {
    const result = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
            result.push(cur); cur = '';
        } else { cur += ch; }
    }
    result.push(cur);
    return result;
}

function csvToJSONLogic(csvStr) {
    const lines = csvStr.trim().split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
    const headers = parseCSVLine(lines[0]);
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        return Object.fromEntries(headers.map((h, i) => {
            const v   = values[i] ?? '';
            const num = Number(v);
            return [h.trim(), v === '' ? '' : (!isNaN(num) && v.trim() !== '' ? num : v)];
        }));
    });
}

function convertJSONtoCSV() {
    const input      = document.getElementById('json-to-csv-input').value.trim();
    const validation = document.getElementById('json-to-csv-validation');
    try {
        const csv  = jsonToCSVLogic(input);
        const rows = input.split('\n').length;
        document.getElementById('json-to-csv-output').value = csv;
        const parsed  = JSON.parse(input);
        const rowCount = (Array.isArray(parsed) ? parsed : [parsed]).length;
        const colCount = csv.split('\n')[0].split(',').length;
        validation.textContent = `✓ Converted — ${rowCount} row${rowCount !== 1 ? 's' : ''}, ${colCount} column${colCount !== 1 ? 's' : ''}`;
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ ' + e.message;
        validation.className   = 'validation-message error';
        document.getElementById('json-to-csv-output').value = '';
    }
}

function convertCSVtoJSON() {
    const input      = document.getElementById('csv-to-json-input').value.trim();
    const validation = document.getElementById('csv-to-json-validation');
    try {
        if (!input) throw new Error('Input is empty');
        const rows     = csvToJSONLogic(input);
        const headers  = parseCSVLine(input.split('\n')[0]);
        document.getElementById('csv-to-json-output').value = JSON.stringify(rows, null, 2);
        validation.textContent = `✓ Converted — ${rows.length} row${rows.length !== 1 ? 's' : ''}, ${headers.length} column${headers.length !== 1 ? 's' : ''}`;
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ ' + e.message;
        validation.className   = 'validation-message error';
        document.getElementById('csv-to-json-output').value = '';
    }
}

// ── SQL Formatter ─────────────────────────────────────────

const SQL_KEYWORDS = [
    'SELECT','DISTINCT','FROM','WHERE','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS','NULL',
    'JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','FULL OUTER JOIN','CROSS JOIN','ON',
    'GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','UNION','UNION ALL','INTERSECT','EXCEPT',
    'INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE',
    'CREATE INDEX','DROP INDEX','CREATE VIEW','DROP VIEW','AS','CASE','WHEN','THEN','ELSE','END',
    'WITH','RECURSIVE','OVER','PARTITION BY','ROW_NUMBER','RANK','DENSE_RANK','COUNT','SUM',
    'AVG','MIN','MAX','COALESCE','NULLIF','CAST','CONVERT','ASC','DESC','PRIMARY KEY',
    'FOREIGN KEY','REFERENCES','NOT NULL','DEFAULT','UNIQUE','CHECK','CONSTRAINT','INDEX'
];

const NEWLINE_BEFORE = new Set([
    'SELECT','FROM','WHERE','AND','OR','JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN',
    'FULL JOIN','FULL OUTER JOIN','CROSS JOIN','GROUP BY','ORDER BY','HAVING',
    'LIMIT','OFFSET','UNION','UNION ALL','INTERSECT','EXCEPT','INSERT INTO',
    'VALUES','UPDATE','SET','DELETE FROM','ON','WITH','OVER','PARTITION BY'
]);

function tokenizeSQL(sql) {
    const tokens = [];
    let i = 0;
    while (i < sql.length) {
        if (/\s/.test(sql[i]))                       { i++; continue; }
        if (sql[i] === '-' && sql[i+1] === '-')      {
            let j = i; while (j < sql.length && sql[j] !== '\n') j++;
            tokens.push({ type: 'comment', val: sql.slice(i, j) }); i = j; continue;
        }
        if (sql[i] === '/' && sql[i+1] === '*')      {
            let j = i + 2; while (j < sql.length && !(sql[j-1] === '*' && sql[j] === '/')) j++;
            tokens.push({ type: 'comment', val: sql.slice(i, j+1) }); i = j + 1; continue;
        }
        if (sql[i] === "'" || sql[i] === '"' || sql[i] === '`') {
            const q = sql[i]; let j = i + 1;
            while (j < sql.length && !(sql[j] === q && sql[j-1] !== '\\')) j++;
            tokens.push({ type: 'string', val: sql.slice(i, j+1) }); i = j + 1; continue;
        }
        if (/[(),;*]/.test(sql[i]))                  { tokens.push({ type: 'punct', val: sql[i] }); i++; continue; }
        if (/[\w.]/.test(sql[i]))                    {
            let j = i; while (j < sql.length && /[\w.]/.test(sql[j])) j++;
            const word = sql.slice(i, j); const up = word.toUpperCase();
            tokens.push({ type: SQL_KEYWORDS.includes(up) ? 'keyword' : 'word', val: word, up });
            i = j; continue;
        }
        tokens.push({ type: 'other', val: sql[i] }); i++;
    }
    return tokens;
}

function validateSQL(standalone = false) {
    const input      = document.getElementById('sql-input').value.trim();
    const validation = document.getElementById('sql-validation');

    if (!input) {
        validation.textContent = '';
        validation.className   = 'validation-message';
        return { ok: false };
    }

    const errors  = [];
    const strRe   = /('([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`)/g;
    const stripped = input.replace(strRe, '""').replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    if (stripped.match(/['"`]/))  errors.push('Unterminated string literal');
    if (/\/\*/.test(stripped))    errors.push('Unclosed block comment');

    let depth = 0;
    for (const ch of stripped) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (depth < 0) { errors.push('Unexpected closing parenthesis'); break; }
    }
    if (depth > 0) errors.push(`${depth} unclosed parenthesis${depth > 1 ? 'es' : ''}`);

    const STMT_STARTERS = ['SELECT','INSERT','UPDATE','DELETE','CREATE','ALTER','DROP','WITH','TRUNCATE','MERGE','CALL','EXPLAIN','SHOW','DESCRIBE','GRANT','REVOKE'];
    const stmts = stripped.split(';').map(s => s.trim()).filter(s => s.length > 0);

    stmts.forEach((stmt, i) => {
        const first = stmt.replace(/\s+/g, ' ').trim().split(' ')[0].toUpperCase();
        if (!STMT_STARTERS.includes(first))
            errors.push(`Statement ${i + 1} starts with unexpected token "${first}"`);
    });

    stmts.forEach((stmt, i) => {
        const up = stmt.toUpperCase();
        if (up.startsWith('SELECT') && !/\bFROM\b/.test(up)) {
            const afterSelect = up.replace(/^SELECT\s+/, '');
            if (/[A-Z_][A-Z0-9_.]*\s*(?:,|\s+[A-Z])/.test(afterSelect))
                errors.push(`Statement ${i + 1}: SELECT references columns but has no FROM clause`);
        }
    });

    // SELECT column list comma check
    stmts.forEach((stmt, stmtIdx) => {
        const tokens    = tokenizeSQL(stmt);
        const selectIdx = tokens.findIndex(t => t.up === 'SELECT');
        if (selectIdx === -1) return;
        let start = selectIdx + 1;
        if (tokens[start] && tokens[start].up === 'DISTINCT') start++;
        const colTokens = [];
        let d = 0;
        for (let i = start; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === 'punct' && t.val === '(') { d++; colTokens.push(t); continue; }
            if (t.type === 'punct' && t.val === ')') { d--; colTokens.push(t); continue; }
            if (d === 0 && t.type === 'keyword' && t.up === 'FROM') break;
            colTokens.push(t);
        }
        if (colTokens.length === 0) return;
        if (colTokens.length === 1 && colTokens[0].val === '*') return;
        const SKIP_KW = new Set(['AS','ASC','DESC','DISTINCT']);
        let expectComma = false, flatDepth = 0;
        for (const t of colTokens) {
            if (t.type === 'punct' && t.val === '(') { flatDepth++; continue; }
            if (t.type === 'punct' && t.val === ')') { flatDepth--; continue; }
            if (flatDepth > 0) continue;
            if (t.type === 'punct' && t.val === ',') { expectComma = false; continue; }
            if (t.type === 'other') continue;
            if (t.type === 'keyword' && SKIP_KW.has(t.up)) continue;
            if (expectComma) { errors.push(`Statement ${stmtIdx + 1}: missing comma in SELECT column list before "${t.val}"`); break; }
            expectComma = true;
        }
    });

    // ORDER BY list comma check
    const ORDER_BY_TERMINATORS = new Set(['LIMIT','OFFSET','UNION','UNION ALL','INTERSECT','EXCEPT','HAVING']);
    const ORDER_BY_SKIP        = new Set(['ASC','DESC','NULLS','FIRST','LAST']);

    stmts.forEach((stmt, stmtIdx) => {
        const tokens = tokenizeSQL(stmt);
        let orderByIdx = -1;
        for (let i = 0; i < tokens.length - 1; i++) {
            if (tokens[i].up === 'ORDER' && tokens[i + 1].up === 'BY') { orderByIdx = i + 2; break; }
        }
        if (orderByIdx === -1) return;
        const orderTokens = [];
        let d = 0;
        for (let i = orderByIdx; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === 'punct' && t.val === '(') { d++; orderTokens.push(t); continue; }
            if (t.type === 'punct' && t.val === ')') { d--; orderTokens.push(t); continue; }
            if (d === 0 && t.type === 'keyword' && ORDER_BY_TERMINATORS.has(t.up)) break;
            orderTokens.push(t);
        }
        if (orderTokens.length === 0) { errors.push(`Statement ${stmtIdx + 1}: ORDER BY has no columns`); return; }
        let expectComma = false, flatDepth = 0;
        for (const t of orderTokens) {
            if (t.type === 'punct' && t.val === '(') { flatDepth++; continue; }
            if (t.type === 'punct' && t.val === ')') { flatDepth--; continue; }
            if (flatDepth > 0) continue;
            if (t.type === 'punct' && t.val === ',') { expectComma = false; continue; }
            if (t.type === 'other') continue;
            if (t.type === 'keyword' && ORDER_BY_SKIP.has(t.up)) continue;
            if (expectComma) { errors.push(`Statement ${stmtIdx + 1}: missing comma in ORDER BY list before "${t.val}"`); break; }
            expectComma = true;
        }
    });

    if (errors.length > 0) {
        validation.textContent = '✗ ' + errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} more)` : '');
        validation.className   = 'validation-message error';
        return { ok: false, errors };
    }

    if (standalone) {
        validation.textContent = `✓ Valid SQL — ${stmts.length} statement${stmts.length !== 1 ? 's' : ''}`;
        validation.className   = 'validation-message success';
    }
    return { ok: true, stmts: stmts.length };
}

function formatSQL() {
    const input      = document.getElementById('sql-input').value.trim();
    const validation = document.getElementById('sql-validation');
    if (!input) { validation.textContent = ''; validation.className = 'validation-message'; return; }
    const check = validateSQL(false);
    if (!check.ok) return;
    try {
        const tokens = tokenizeSQL(input);
        let out = '', indent = 0;
        const nl = (extra = 0) => { out += '\n' + '  '.repeat(indent + extra); };
        tokens.forEach((tok, idx) => {
            const up   = tok.up || tok.val.toUpperCase();
            const prev = idx > 0 ? tokens[idx - 1] : null;
            if (tok.type === 'punct' && tok.val === '(')      { out += '('; indent++; }
            else if (tok.type === 'punct' && tok.val === ')') { indent = Math.max(0, indent - 1); nl(); out += ')'; }
            else if (tok.type === 'punct' && tok.val === ',') { out += ','; nl(); }
            else if (tok.type === 'punct' && tok.val === ';') { out += ';'; nl(); }
            else if (tok.type === 'keyword' && NEWLINE_BEFORE.has(up)) { if (out.length > 0) nl(); out += up; }
            else if (tok.type === 'keyword') { if (prev && prev.type !== 'punct') out += ' '; out += up; }
            else { if (prev && prev.type !== 'punct' && prev.val !== '(') out += ' '; out += tok.val; }
        });
        document.getElementById('sql-output').value = out.trim();
        validation.textContent = `✓ Valid SQL — ${check.stmts} statement${check.stmts !== 1 ? 's' : ''}`;
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Error: ' + e.message;
        validation.className   = 'validation-message error';
    }
}

function minifySQL() {
    const input      = document.getElementById('sql-input').value.trim();
    const validation = document.getElementById('sql-validation');
    if (!input) return;
    const check = validateSQL(false);
    if (!check.ok) return;
    const tokens = tokenizeSQL(input);
    let out = '';
    tokens.forEach((tok, idx) => {
        const prev = idx > 0 ? tokens[idx - 1] : null;
        const val  = tok.type === 'keyword' ? (tok.up || tok.val.toUpperCase()) : tok.val;
        const needsSpace = prev && prev.val !== '(' && tok.val !== ')' && tok.val !== ',' && tok.val !== ';' && tok.val !== '(';
        out += (needsSpace ? ' ' : '') + val;
    });
    document.getElementById('sql-output').value = out.trim();
    validation.textContent = `✓ Valid SQL — minified, ${check.stmts} statement${check.stmts !== 1 ? 's' : ''}`;
    validation.className   = 'validation-message success';
}
