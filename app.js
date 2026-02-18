// Tool Navigation
document.addEventListener('DOMContentLoaded', () => {
    const toolButtons = document.querySelectorAll('.tool-btn');
    const toolPanels = document.querySelectorAll('.tool-panel');

    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolId = button.getAttribute('data-tool');
            
            // Update active button
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding panel
            toolPanels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(toolId).classList.add('active');
        });
    });

    // Initialize timestamp converter with current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Initialize color converter
    convertColor();
});

// Utility Functions
function clearInput(...ids) {
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                element.value = '';
            } else {
                element.innerHTML = '';
            }
        }
    });
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.value || element.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy', 'error');
    });
}

function copyToClipboardFromInput(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    navigator.clipboard.writeText(element.value).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy', 'error');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `validation-message ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// URL Encoder/Decoder
function encodeURL() {
    const input = document.getElementById('url-input').value;
    try {
        const encoded = encodeURIComponent(input);
        document.getElementById('url-output').value = encoded;
    } catch (error) {
        showNotification('Encoding error: ' + error.message, 'error');
    }
}

function decodeURL() {
    const input = document.getElementById('url-input').value;
    try {
        const decoded = decodeURIComponent(input);
        document.getElementById('url-output').value = decoded;
    } catch (error) {
        showNotification('Decoding error: ' + error.message, 'error');
    }
}

// JSON Formatter
function formatJSON() {
    const input = document.getElementById('json-input').value;
    const indent = parseInt(document.getElementById('json-indent').value) || 2;
    const validation = document.getElementById('json-validation');
    
    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, indent);
        document.getElementById('json-output').value = formatted;
        validation.textContent = '✓ Valid JSON';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid JSON: ' + error.message;
        validation.className = 'validation-message error';
    }
}

function minifyJSON() {
    const input = document.getElementById('json-input').value;
    const validation = document.getElementById('json-validation');
    
    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        document.getElementById('json-output').value = minified;
        validation.textContent = '✓ Valid JSON (Minified)';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid JSON: ' + error.message;
        validation.className = 'validation-message error';
    }
}

function validateJSON() {
    const input = document.getElementById('json-input').value;
    const validation = document.getElementById('json-validation');
    
    try {
        JSON.parse(input);
        validation.textContent = '✓ Valid JSON';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid JSON: ' + error.message;
        validation.className = 'validation-message error';
    }
}

// JSON Visualizer
function visualizeJSON() {
    const input = document.getElementById('json-viz-input').value;
    const output = document.getElementById('json-viz-output');
    const validation = document.getElementById('json-viz-validation');
    
    try {
        const parsed = JSON.parse(input);
        output.innerHTML = '';
        
        const rootNode = createJSONTreeNode('root', parsed, true);
        output.appendChild(rootNode);
        
        validation.textContent = '✓ Valid JSON - Click keys to expand/collapse';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid JSON: ' + error.message;
        validation.className = 'validation-message error';
        output.innerHTML = '';
    }
}

function createJSONTreeNode(key, value, isRoot = false) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = isRoot ? 'json-tree-node root' : 'json-tree-node';
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'json-tree-item';
    
    const type = getJSONType(value);
    
    if (type === 'object' || type === 'array') {
        const toggle = document.createElement('span');
        toggle.className = 'json-tree-toggle';
        toggle.textContent = '▼';
        toggle.onclick = function(e) {
            e.stopPropagation();
            toggleJSONNode(this);
        };
        itemDiv.appendChild(toggle);
        
        if (!isRoot) {
            const keySpan = document.createElement('span');
            keySpan.className = 'json-tree-key';
            keySpan.textContent = key;
            keySpan.onclick = function(e) {
                e.stopPropagation();
                toggleJSONNode(toggle);
            };
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
            value.forEach((item, index) => {
                childrenDiv.appendChild(createJSONTreeNode(`[${index}]`, item));
            });
        } else {
            Object.keys(value).forEach(k => {
                childrenDiv.appendChild(createJSONTreeNode(k, value[k]));
            });
        }
        
        if (keys.length === 0) {
            const emptySpan = document.createElement('span');
            emptySpan.className = 'json-tree-empty';
            emptySpan.textContent = type === 'array' ? ' empty' : ' empty';
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
        valueSpan.className = `json-tree-value ${type}`;
        
        if (type === 'string') {
            valueSpan.textContent = `"${value}"`;
        } else if (type === 'null') {
            valueSpan.textContent = 'null';
        } else {
            valueSpan.textContent = String(value);
        }
        
        itemDiv.appendChild(valueSpan);
        nodeDiv.appendChild(itemDiv);
    }
    
    return nodeDiv;
}

function getJSONType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'unknown';
}

function toggleJSONNode(toggle) {
    const node = toggle.parentElement.parentElement;
    const children = node.querySelector('.json-tree-children');
    
    if (children) {
        children.classList.toggle('collapsed');
        toggle.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
    }
}

function expandAllJSON() {
    const output = document.getElementById('json-viz-output');
    const allChildren = output.querySelectorAll('.json-tree-children');
    const allToggles = output.querySelectorAll('.json-tree-toggle');
    
    allChildren.forEach(child => child.classList.remove('collapsed'));
    allToggles.forEach(toggle => toggle.textContent = '▼');
}

function collapseAllJSON() {
    const output = document.getElementById('json-viz-output');
    const allChildren = output.querySelectorAll('.json-tree-children');
    const allToggles = output.querySelectorAll('.json-tree-toggle');
    
    allChildren.forEach(child => child.classList.add('collapsed'));
    allToggles.forEach(toggle => toggle.textContent = '▶');
}

// XML Formatter
function formatXML() {
    const input = document.getElementById('xml-input').value;
    const indent = parseInt(document.getElementById('xml-indent').value) || 2;
    const validation = document.getElementById('xml-validation');
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(input, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }
        
        const formatted = formatXMLString(xmlDoc, indent);
        document.getElementById('xml-output').value = formatted;
        validation.textContent = '✓ Valid XML';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid XML: ' + error.message;
        validation.className = 'validation-message error';
    }
}

function formatXMLString(xmlDoc, indent) {
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(xmlDoc);
    
    // Remove existing formatting
    xmlString = xmlString.replace(/>\s*</g, '><');
    
    // Add indentation
    const indentStr = ' '.repeat(indent);
    let formatted = '';
    let depth = 0;
    
    xmlString.split(/(<[^>]+>)/g).forEach(part => {
        if (part.trim() === '') return;
        
        if (part.startsWith('</')) {
            depth--;
            formatted += '\n' + indentStr.repeat(depth) + part;
        } else if (part.startsWith('<')) {
            formatted += '\n' + indentStr.repeat(depth) + part;
            if (!part.startsWith('<?') && !part.startsWith('<!') && !part.endsWith('/>')) {
                depth++;
            }
        } else {
            formatted += part;
        }
    });
    
    return formatted.trim();
}

function minifyXML() {
    const input = document.getElementById('xml-input').value;
    const validation = document.getElementById('xml-validation');
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(input, 'text/xml');
        
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }
        
        const serializer = new XMLSerializer();
        let minified = serializer.serializeToString(xmlDoc);
        minified = minified.replace(/>\s+</g, '><').trim();
        
        document.getElementById('xml-output').value = minified;
        validation.textContent = '✓ Valid XML (Minified)';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid XML: ' + error.message;
        validation.className = 'validation-message error';
    }
}

function validateXML() {
    const input = document.getElementById('xml-input').value;
    const validation = document.getElementById('xml-validation');
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(input, 'text/xml');
        
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }
        
        validation.textContent = '✓ Valid XML';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid XML: ' + error.message;
        validation.className = 'validation-message error';
    }
}

// JWT Decoder
function decodeJWT() {
    const input = document.getElementById('jwt-input').value.trim();
    const validation = document.getElementById('jwt-validation');
    
    try {
        const parts = input.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
        }
        
        // Decode header
        const header = JSON.parse(atob(parts[0]));
        document.getElementById('jwt-header').textContent = JSON.stringify(header, null, 2);
        
        // Decode payload
        const payload = JSON.parse(atob(parts[1]));
        
        // Add human-readable dates if present
        if (payload.exp) {
            payload.exp_readable = new Date(payload.exp * 1000).toISOString();
        }
        if (payload.iat) {
            payload.iat_readable = new Date(payload.iat * 1000).toISOString();
        }
        if (payload.nbf) {
            payload.nbf_readable = new Date(payload.nbf * 1000).toISOString();
        }
        
        document.getElementById('jwt-payload').textContent = JSON.stringify(payload, null, 2);
        
        // Signature (cannot be decoded)
        document.getElementById('jwt-signature').textContent = parts[2];
        
        validation.textContent = '✓ JWT decoded successfully';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid JWT: ' + error.message;
        validation.className = 'validation-message error';
        document.getElementById('jwt-header').textContent = '';
        document.getElementById('jwt-payload').textContent = '';
        document.getElementById('jwt-signature').textContent = '';
    }
}

// Base64 Encoder/Decoder
function encodeBase64() {
    const input = document.getElementById('base64-input').value;
    try {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('base64-output').value = encoded;
    } catch (error) {
        showNotification('Encoding error: ' + error.message, 'error');
    }
}

function decodeBase64() {
    const input = document.getElementById('base64-input').value;
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('base64-output').value = decoded;
    } catch (error) {
        showNotification('Decoding error: ' + error.message, 'error');
    }
}

// Hash Generator
function generateHashes() {
    const input = document.getElementById('hash-input').value;
    
    if (!input) {
        showNotification('Please enter text to hash', 'error');
        return;
    }
    
    // Generate MD5
    const md5 = CryptoJS.MD5(input).toString();
    document.getElementById('hash-md5').value = md5;
    
    // Generate SHA-1
    const sha1 = CryptoJS.SHA1(input).toString();
    document.getElementById('hash-sha1').value = sha1;
    
    // Generate SHA-256
    const sha256 = CryptoJS.SHA256(input).toString();
    document.getElementById('hash-sha256').value = sha256;
    
    // Generate SHA-512
    const sha512 = CryptoJS.SHA512(input).toString();
    document.getElementById('hash-sha512').value = sha512;
    
    showNotification('Hashes generated successfully', 'success');
}

// UUID Generator
function generateUUID() {
    const uuid = crypto.randomUUID();
    document.getElementById('uuid-output').value = uuid;
}

function generateMultipleUUIDs() {
    const uuids = [];
    for (let i = 0; i < 10; i++) {
        uuids.push(crypto.randomUUID());
    }
    document.getElementById('uuid-output').value = uuids.join('\n');
}

// Timestamp Converter
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-unix').value = Math.floor(now.getTime() / 1000);
    document.getElementById('current-unix-ms').value = now.getTime();
    document.getElementById('current-iso').value = now.toISOString();
}

function convertTimestamp() {
    const input = document.getElementById('timestamp-input').value;
    const output = document.getElementById('timestamp-output');
    
    try {
        let timestamp = parseInt(input);
        
        // Check if timestamp is in seconds or milliseconds
        if (timestamp < 10000000000) {
            timestamp *= 1000; // Convert to milliseconds
        }
        
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            throw new Error('Invalid timestamp');
        }
        
        output.innerHTML = `
            <strong>Unix Timestamp (seconds):</strong> ${Math.floor(date.getTime() / 1000)}<br>
            <strong>Unix Timestamp (milliseconds):</strong> ${date.getTime()}<br>
            <strong>ISO 8601:</strong> ${date.toISOString()}<br>
            <strong>UTC:</strong> ${date.toUTCString()}<br>
            <strong>Local:</strong> ${date.toLocaleString()}<br>
            <strong>Date:</strong> ${date.toLocaleDateString()}<br>
            <strong>Time:</strong> ${date.toLocaleTimeString()}
        `;
    } catch (error) {
        output.innerHTML = `<span style="color: var(--error-color);">Error: ${error.message}</span>`;
    }
}

function convertDateToTimestamp() {
    const input = document.getElementById('date-input').value;
    const output = document.getElementById('date-output');
    
    try {
        if (!input) {
            throw new Error('Please select a date and time');
        }
        
        const date = new Date(input);
        
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        
        output.innerHTML = `
            <strong>Unix Timestamp (seconds):</strong> ${Math.floor(date.getTime() / 1000)}<br>
            <strong>Unix Timestamp (milliseconds):</strong> ${date.getTime()}<br>
            <strong>ISO 8601:</strong> ${date.toISOString()}<br>
            <strong>UTC:</strong> ${date.toUTCString()}
        `;
    } catch (error) {
        output.innerHTML = `<span style="color: var(--error-color);">Error: ${error.message}</span>`;
    }
}

// Color Converter
function convertColor() {
    const color = document.getElementById('color-picker').value;
    displayColorValues(color);
}

function parseColorInput() {
    const input = document.getElementById('color-input').value.trim();
    
    try {
        let color;
        
        // Try parsing as HEX
        if (input.startsWith('#')) {
            color = input;
        }
        // Try parsing as RGB
        else if (input.startsWith('rgb')) {
            const match = input.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                const r = parseInt(match[1]);
                const g = parseInt(match[2]);
                const b = parseInt(match[3]);
                color = rgbToHex(r, g, b);
            }
        }
        // Try parsing as HSL
        else if (input.startsWith('hsl')) {
            const match = input.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                const h = parseInt(match[1]);
                const s = parseInt(match[2]);
                const l = parseInt(match[3]);
                color = hslToHex(h, s, l);
            }
        }
        
        if (color) {
            document.getElementById('color-picker').value = color;
            displayColorValues(color);
        } else {
            showNotification('Invalid color format', 'error');
        }
    } catch (error) {
        showNotification('Error parsing color: ' + error.message, 'error');
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
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }
    
    return rgbToHex(
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    );
}
