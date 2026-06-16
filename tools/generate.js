// ── Hash Generator ────────────────────────────────────────

function generateHashes() {
    const input = document.getElementById('hash-input').value;
    if (!input) { showNotification('Please enter text to hash', 'error'); return; }
    document.getElementById('hash-md5').value    = CryptoJS.MD5(input).toString();
    document.getElementById('hash-sha1').value   = CryptoJS.SHA1(input).toString();
    document.getElementById('hash-sha256').value = CryptoJS.SHA256(input).toString();
    document.getElementById('hash-sha512').value = CryptoJS.SHA512(input).toString();
    showNotification('Hashes generated successfully', 'success');
}

// ── UUID Generator ────────────────────────────────────────

function generateUUIDv1() {
    const now     = Date.now();
    const timeHex = (now * 10000 + 0x01B21DD213814000).toString(16).padStart(16, '0');
    const timeLow = timeHex.substr(-8);
    const timeMid = timeHex.substr(-12, 4);
    const timeHi  = '1' + timeHex.substr(-15, 3);
    const clockSeq = crypto.getRandomValues(new Uint8Array(2));
    clockSeq[0] = (clockSeq[0] & 0x3f) | 0x80;
    const node = crypto.getRandomValues(new Uint8Array(6));
    return [
        timeLow, timeMid, timeHi,
        Array.from(clockSeq).map(b => b.toString(16).padStart(2, '0')).join(''),
        Array.from(node).map(b => b.toString(16).padStart(2, '0')).join('')
    ].join('-');
}

async function generateNameBasedUUID(version, namespace, name) {
    const namespaceUUIDs = {
        dns:  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        url:  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        oid:  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
    };
    const namespaceUUID  = namespaceUUIDs[namespace] || namespace;
    const namespaceBytes = namespaceUUID.replace(/-/g, '').match(/.{2}/g).map(h => parseInt(h, 16));
    const nameBytes      = new TextEncoder().encode(name);
    const data           = new Uint8Array([...namespaceBytes, ...nameBytes]);
    const hashBuffer     = await crypto.subtle.digest(version === 'v3' ? 'SHA-1' : 'SHA-256', data);
    const hashArray      = new Uint8Array(hashBuffer);
    const hex            = Array.from(hashArray.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('');
    const versionBit     = version === 'v3' ? '3' : '5';
    return [
        hex.substr(0, 8),
        hex.substr(8, 4),
        versionBit + hex.substr(13, 3),
        ((parseInt(hex.substr(16, 2), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hex.substr(18, 2),
        hex.substr(20, 12)
    ].join('-');
}

function toggleNamespaceInput() {
    const version = document.getElementById('uuid-version').value;
    document.getElementById('namespace-input').style.display = (version === 'v3' || version === 'v5') ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const namespaceSelect = document.getElementById('uuid-namespace');
    const customNamespace = document.getElementById('custom-namespace');
    if (namespaceSelect) {
        namespaceSelect.addEventListener('change', () => {
            customNamespace.style.display = namespaceSelect.value === 'custom' ? 'block' : 'none';
        });
    }
});

async function generateUUIDByVersion() {
    const version = document.getElementById('uuid-version').value;
    let uuid;
    try {
        if (version === 'v1') {
            uuid = generateUUIDv1();
        } else if (version === 'v4') {
            uuid = crypto.randomUUID();
        } else {
            const namespaceSelect = document.getElementById('uuid-namespace').value;
            const namespace = namespaceSelect === 'custom'
                ? document.getElementById('custom-namespace').value : namespaceSelect;
            const name = document.getElementById('uuid-name').value;
            if (!name)                              { showNotification('Please enter a name for UUID generation', 'error'); return; }
            if (namespaceSelect === 'custom' && !namespace) { showNotification('Please enter a custom namespace UUID', 'error'); return; }
            uuid = await generateNameBasedUUID(version, namespace, name);
        }
        document.getElementById('uuid-output').value         = uuid;
        document.getElementById('uuid-compact-output').value = uuid.replace(/-/g, '').toUpperCase();
    } catch (e) {
        showNotification('Error generating UUID: ' + e.message, 'error');
    }
}

function generateMultipleUUIDs() {
    const version = document.getElementById('uuid-version').value;
    if (version === 'v3' || version === 'v5') {
        showNotification('Multiple UUID generation not supported for name-based UUIDs.', 'error');
        return;
    }
    const uuids = Array.from({ length: 10 }, () => version === 'v1' ? generateUUIDv1() : crypto.randomUUID());
    document.getElementById('uuid-output').value         = uuids.join('\n');
    document.getElementById('uuid-compact-output').value = uuids.map(u => u.replace(/-/g, '').toUpperCase()).join('\n');
}

function convertToCompact() {
    const input = document.getElementById('uuid-output').value;
    if (!input.trim()) { document.getElementById('uuid-compact-output').value = ''; return; }
    document.getElementById('uuid-compact-output').value = input.split('\n')
        .map(l => l.trim() ? l.trim().replace(/-/g, '').toUpperCase() : '').join('\n');
}

function convertToStandard() {
    const input = document.getElementById('uuid-compact-output').value;
    if (!input.trim()) { document.getElementById('uuid-output').value = ''; return; }
    document.getElementById('uuid-output').value = input.split('\n').map(line => {
        const t = line.trim().replace(/-/g, '').toLowerCase();
        if (!t) return '';
        if (t.length !== 32 || !/^[0-9a-f]{32}$/i.test(t)) return line;
        return `${t.substr(0,8)}-${t.substr(8,4)}-${t.substr(12,4)}-${t.substr(16,4)}-${t.substr(20,12)}`;
    }).join('\n');
}

// ── Timestamp Converter ───────────────────────────────────

function updateCurrentTime() {
    const now    = new Date();
    const locale = navigator.language || 'en-US';
    document.getElementById('current-unix').value   = Math.floor(now.getTime() / 1000);
    document.getElementById('current-unix-ms').value = now.getTime();
    document.getElementById('current-iso').value    = now.toISOString();
    document.getElementById('current-locale').value = now.toLocaleString(locale, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    });
}

function getRelativeTime(date) {
    const now       = new Date();
    const diffMs    = now - date;
    const diffSec   = Math.floor(Math.abs(diffMs) / 1000);
    const diffMin   = Math.floor(diffSec / 60);
    const diffHour  = Math.floor(diffMin / 60);
    const diffDay   = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear  = Math.floor(diffDay / 365);
    const p = (n, unit) => `${n} ${unit}${n !== 1 ? 's' : ''}`;
    const fmt = (n, unit) => diffMs < 0 ? `in ${p(n, unit)}` : `${p(n, unit)} ago`;
    if (diffSec  < 60)  return fmt(diffSec, 'second');
    if (diffMin  < 60)  return fmt(diffMin, 'minute');
    if (diffHour < 24)  return fmt(diffHour, 'hour');
    if (diffDay  < 30)  return fmt(diffDay, 'day');
    if (diffMonth < 12) return fmt(diffMonth, 'month');
    return fmt(diffYear, 'year');
}

function convertTimestamp() {
    const input  = document.getElementById('timestamp-input').value;
    const output = document.getElementById('timestamp-output');
    try {
        let ts = parseInt(input);
        if (ts < 10000000000) ts *= 1000;
        const date = new Date(ts);
        if (isNaN(date.getTime())) throw new Error('Invalid timestamp');
        const locale = navigator.language || 'en-US';
        output.innerHTML = `
            <div class="timestamp-section"><h4>Timestamps</h4>
                <strong>Unix (seconds):</strong> ${Math.floor(date.getTime() / 1000)}<br>
                <strong>Unix (milliseconds):</strong> ${date.getTime()}<br>
            </div>
            <div class="timestamp-section"><h4>Standard Formats</h4>
                <strong>ISO 8601:</strong> ${date.toISOString()}<br>
                <strong>UTC:</strong> ${date.toUTCString()}<br>
            </div>
            <div class="timestamp-section"><h4>Browser Locale (${locale})</h4>
                <strong>Full Date &amp; Time:</strong> ${date.toLocaleString(locale,{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'})}<br>
                <strong>Long Date:</strong> ${date.toLocaleDateString(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}<br>
                <strong>Short Date:</strong> ${date.toLocaleDateString(locale)}<br>
                <strong>Time:</strong> ${date.toLocaleTimeString(locale)}<br>
                <strong>Time (24h):</strong> ${date.toLocaleTimeString(locale,{hour12:false})}<br>
            </div>
            <div class="timestamp-section"><h4>Relative Time</h4>
                <strong>From Now:</strong> ${getRelativeTime(date)}
            </div>`;
    } catch (e) {
        output.innerHTML = `<span style="color:var(--error-color)">Error: ${e.message}</span>`;
    }
}

function convertDateToTimestamp() {
    const input  = document.getElementById('date-input').value;
    const output = document.getElementById('date-output');
    try {
        if (!input) throw new Error('Please select a date and time');
        const date = new Date(input);
        if (isNaN(date.getTime())) throw new Error('Invalid date');
        const locale = navigator.language || 'en-US';
        output.innerHTML = `
            <div class="timestamp-section"><h4>Timestamps</h4>
                <strong>Unix (seconds):</strong> ${Math.floor(date.getTime() / 1000)}<br>
                <strong>Unix (milliseconds):</strong> ${date.getTime()}<br>
            </div>
            <div class="timestamp-section"><h4>Standard Formats</h4>
                <strong>ISO 8601:</strong> ${date.toISOString()}<br>
                <strong>UTC:</strong> ${date.toUTCString()}<br>
            </div>
            <div class="timestamp-section"><h4>Browser Locale (${locale})</h4>
                <strong>Full Date &amp; Time:</strong> ${date.toLocaleString(locale,{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'})}
            </div>`;
    } catch (e) {
        output.innerHTML = `<span style="color:var(--error-color)">Error: ${e.message}</span>`;
    }
}

// ── Color Converter ───────────────────────────────────────

function convertColor() {
    displayColorValues(document.getElementById('color-picker').value);
}

function parseColorInput() {
    const input = document.getElementById('color-input').value.trim();
    try {
        let color;
        if (input.startsWith('#')) {
            color = input;
        } else if (input.startsWith('rgb')) {
            const m = input.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (m) color = rgbToHex(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
        } else if (input.startsWith('hsl')) {
            const m = input.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (m) color = hslToHex(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
        }
        if (color) {
            document.getElementById('color-picker').value = color;
            displayColorValues(color);
        } else {
            showNotification('Invalid color format', 'error');
        }
    } catch (e) {
        showNotification('Error parsing color: ' + e.message, 'error');
    }
}

function displayColorValues(hex) {
    document.getElementById('color-preview').style.backgroundColor = hex;
    document.getElementById('color-hex').value = hex.toUpperCase();
    const rgb = hexToRgb(hex);
    document.getElementById('color-rgb').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    document.getElementById('color-hsl').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null;
}

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g-b)/d + (g<b?6:0)) / 6; break;
            case g: h = ((b-r)/d + 2) / 6; break;
            case b: h = ((r-g)/d + 4) / 6; break;
        }
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs((h/60) % 2 - 1));
    const m = l - c/2;
    let r=0, g=0, b=0;
    if      (h < 60)  { r=c; g=x; b=0; }
    else if (h < 120) { r=x; g=c; b=0; }
    else if (h < 180) { r=0; g=c; b=x; }
    else if (h < 240) { r=0; g=x; b=c; }
    else if (h < 300) { r=x; g=0; b=c; }
    else              { r=c; g=0; b=x; }
    return rgbToHex(Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255));
}

// ── Cron Generator ────────────────────────────────────────

const CRON_MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CRON_DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function cronFieldValid(val, min, max) {
    if (val === '*') return true;
    // */n
    if (/^\*\/\d+$/.test(val)) {
        const n = parseInt(val.slice(2));
        return n >= 1 && n <= max;
    }
    // ranges and lists: e.g. 1-5, 1,3,5, 1-5,7
    const parts = val.split(',');
    return parts.every(p => {
        const range = p.split('-');
        if (range.length === 2) {
            const [a, b] = range.map(Number);
            return !isNaN(a) && !isNaN(b) && a >= min && b <= max && a <= b;
        }
        const n = Number(p);
        return !isNaN(n) && n >= min && n <= max;
    });
}

function cronDescribeField(val, singular, plural, names, offset = 0) {
    if (val === '*') return `every ${singular}`;
    if (/^\*\/\d+$/.test(val)) return `every ${val.slice(2)} ${plural}`;
    const parts = val.split(',');
    const labels = parts.flatMap(p => {
        const range = p.split('-');
        if (range.length === 2) {
            const [a, b] = range.map(Number);
            const from = names ? names[a - offset] : a;
            const to   = names ? names[b - offset] : b;
            return [`${from}–${to}`];
        }
        const n = parseInt(p);
        return [names ? names[n - offset] : n];
    });
    return labels.join(', ');
}

function cronDescribe(minute, hour, dom, month, dow) {
    const errors = [];
    if (!cronFieldValid(minute,  0, 59)) errors.push('minute');
    if (!cronFieldValid(hour,    0, 23)) errors.push('hour');
    if (!cronFieldValid(dom,     1, 31)) errors.push('day-of-month');
    if (!cronFieldValid(month,   1, 12)) errors.push('month');
    if (!cronFieldValid(dow,     0,  6)) errors.push('day-of-week');
    if (errors.length) return { ok: false, error: `Invalid value in: ${errors.join(', ')}` };

    const mDesc   = cronDescribeField(minute,  'minute',   'minutes');
    const hDesc   = cronDescribeField(hour,    'hour',     'hours');
    const domDesc = cronDescribeField(dom,     'day',      'days');
    const monDesc = cronDescribeField(month,   'month',    'months',   CRON_MONTHS, 1);
    const dowDesc = cronDescribeField(dow,     'weekday',  'weekdays', CRON_DAYS,   0);

    let desc = 'At ';
    if (minute === '*' && hour === '*') {
        desc += 'every minute';
    } else if (minute.startsWith('*/')) {
        desc += `every ${minute.slice(2)} minutes`;
        if (hour !== '*') desc += ` past ${hDesc}`;
    } else {
        const mins = minute === '*' ? '00' : minute.padStart(2, '0');
        desc += hour === '*' ? `minute ${mins} of every hour` : `${hour.padStart(2,'0')}:${mins}`;
    }
    if (dom !== '*')   desc += `, on day ${domDesc}`;
    if (dow !== '*')   desc += `, on ${dowDesc}`;
    if (month !== '*') desc += `, in ${monDesc}`;

    return { ok: true, desc };
}

// Compute next N run times from now
function cronNextRuns(minute, hour, dom, month, dow, count = 5) {
    const now  = new Date();
    const runs = [];
    // Step minute by minute from now+1min, cap at 1 year of iterations
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
    let   d     = new Date(start);
    let   iters = 0;

    const matches = (val, n, min, max) => {
        if (val === '*') return true;
        if (/^\*\/\d+$/.test(val)) return (n - min) % parseInt(val.slice(2)) === 0;
        return val.split(',').some(p => {
            const range = p.split('-');
            if (range.length === 2) return n >= parseInt(range[0]) && n <= parseInt(range[1]);
            return parseInt(p) === n;
        });
    };

    while (runs.length < count && iters < 525600) {
        iters++;
        const mi = d.getMinutes(), hr = d.getHours(),
              dm = d.getDate(),    mo = d.getMonth() + 1, dw = d.getDay();
        if (matches(minute, mi, 0, 59) && matches(hour, hr, 0, 23) &&
            matches(dom, dm, 1, 31)    && matches(month, mo, 1, 12) &&
            matches(dow, dw, 0, 6)) {
            runs.push(new Date(d));
        }
        d.setMinutes(d.getMinutes() + 1);
    }
    return runs;
}

function cronUpdate() {
    const minute = document.getElementById('cron-minute').value.trim();
    const hour   = document.getElementById('cron-hour').value.trim();
    const dom    = document.getElementById('cron-dom').value.trim();
    const month  = document.getElementById('cron-month').value.trim();
    const dow    = document.getElementById('cron-dow').value.trim();

    const expr = [minute, hour, dom, month, dow].join(' ');
    document.getElementById('cron-expression').value = expr;

    cronRender(minute, hour, dom, month, dow);
}

function cronParse() {
    const expr   = document.getElementById('cron-expression').value.trim();
    const parts  = expr.split(/\s+/);
    if (parts.length !== 5) {
        document.getElementById('cron-description').textContent = 'Expression must have exactly 5 fields.';
        document.getElementById('cron-description').className   = 'cron-description cron-desc-error';
        document.getElementById('cron-next-runs').innerHTML     = '';
        return;
    }
    const [minute, hour, dom, month, dow] = parts;
    document.getElementById('cron-minute').value = minute;
    document.getElementById('cron-hour').value   = hour;
    document.getElementById('cron-dom').value    = dom;
    document.getElementById('cron-month').value  = month;
    document.getElementById('cron-dow').value    = dow;

    // Clear error states
    ['cron-minute','cron-hour','cron-dom','cron-month','cron-dow'].forEach(id =>
        document.getElementById(id).classList.remove('cron-error'));

    cronRender(minute, hour, dom, month, dow);
}

function cronRender(minute, hour, dom, month, dow) {
    const descEl  = document.getElementById('cron-description');
    const nextEl  = document.getElementById('cron-next-runs');
    const fields  = [
        { id: 'cron-minute', val: minute,  min: 0, max: 59 },
        { id: 'cron-hour',   val: hour,    min: 0, max: 23 },
        { id: 'cron-dom',    val: dom,     min: 1, max: 31 },
        { id: 'cron-month',  val: month,   min: 1, max: 12 },
        { id: 'cron-dow',    val: dow,     min: 0, max:  6 },
    ];

    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (cronFieldValid(f.val, f.min, f.max)) el.classList.remove('cron-error');
        else el.classList.add('cron-error');
    });

    const result = cronDescribe(minute, hour, dom, month, dow);
    if (!result.ok) {
        descEl.textContent = result.error;
        descEl.className   = 'cron-description cron-desc-error';
        nextEl.innerHTML   = '';
        return;
    }

    descEl.textContent = result.desc;
    descEl.className   = 'cron-description';

    const runs = cronNextRuns(minute, hour, dom, month, dow);
    const locale = navigator.language || 'en-US';
    nextEl.innerHTML = runs.map(d =>
        `<div class="cron-next-run-item">${d.toLocaleString(locale, {
            weekday: 'short', year: 'numeric', month: 'short',
            day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}</div>`
    ).join('');
}

function cronSetPreset(expr) {
    document.getElementById('cron-expression').value = expr;
    cronParse();
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial render with default * * * * *
    const btn = document.querySelector('[data-tool="cron-generator"]');
    if (btn) btn.addEventListener('click', () => cronRender('*','*','*','*','*'));
});
