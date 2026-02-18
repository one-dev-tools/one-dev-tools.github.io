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
let currentJSONData = null;

function visualizeJSON() {
    const input = document.getElementById('json-viz-input').value;
    const output = document.getElementById('json-viz-output');
    const validation = document.getElementById('json-viz-validation');
    
    try {
        currentJSONData = JSON.parse(input);
        output.innerHTML = '';
        
        const rootNode = createJSONTreeNode('root', currentJSONData, true, []);
        output.appendChild(rootNode);
        
        validation.textContent = '✓ Valid JSON - Click keys to expand/collapse, click values to edit';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid JSON: ' + error.message;
        validation.className = 'validation-message error';
        output.innerHTML = '';
        currentJSONData = null;
    }
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
                childrenDiv.appendChild(createJSONTreeNode(`[${index}]`, item, false, [...path, index]));
            });
        } else {
            Object.keys(value).forEach(k => {
                childrenDiv.appendChild(createJSONTreeNode(k, value[k], false, [...path, k]));
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
        valueSpan.className = `json-tree-value ${type} editable`;
        valueSpan.contentEditable = false;
        valueSpan.dataset.path = JSON.stringify(path);
        valueSpan.dataset.type = type;
        
        if (type === 'string') {
            valueSpan.textContent = `"${value}"`;
        } else if (type === 'null') {
            valueSpan.textContent = 'null';
        } else {
            valueSpan.textContent = String(value);
        }
        
        // Make value editable
        valueSpan.onclick = function(e) {
            e.stopPropagation();
            makeValueEditable(this);
        };
        
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
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(valueSpan);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    const saveEdit = () => {
        valueSpan.classList.remove('editing');
        valueSpan.contentEditable = false;
        
        const newValue = valueSpan.textContent.trim();
        const type = valueSpan.dataset.type;
        const path = JSON.parse(valueSpan.dataset.path);
        
        try {
            let parsedValue;
            
            if (type === 'string') {
                // Remove quotes if present
                parsedValue = newValue.replace(/^"|"$/g, '');
                valueSpan.textContent = `"${parsedValue}"`;
            } else if (type === 'number') {
                parsedValue = Number(newValue);
                if (isNaN(parsedValue)) {
                    throw new Error('Invalid number');
                }
                valueSpan.textContent = String(parsedValue);
            } else if (type === 'boolean') {
                if (newValue !== 'true' && newValue !== 'false') {
                    throw new Error('Boolean must be true or false');
                }
                parsedValue = newValue === 'true';
                valueSpan.textContent = String(parsedValue);
            } else if (type === 'null') {
                if (newValue !== 'null') {
                    throw new Error('Must be null');
                }
                parsedValue = null;
                valueSpan.textContent = 'null';
            }
            
            // Update the data structure
            updateJSONValue(path, parsedValue);
            
        } catch (error) {
            valueSpan.textContent = originalValue;
            showNotification('Invalid value: ' + error.message, 'error');
        }
    };
    
    valueSpan.onblur = saveEdit;
    valueSpan.onkeydown = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
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
    for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
    }
    
    if (path.length > 0) {
        obj[path[path.length - 1]] = newValue;
    } else {
        currentJSONData = newValue;
    }
}

function copyVisualizedJSON() {
    if (!currentJSONData) {
        showNotification('No JSON to copy. Please visualize JSON first.', 'error');
        return;
    }
    
    try {
        const jsonString = JSON.stringify(currentJSONData, null, 2);
        navigator.clipboard.writeText(jsonString).then(() => {
            showNotification('JSON copied to clipboard!', 'success');
        }).catch(err => {
            showNotification('Failed to copy JSON', 'error');
        });
    } catch (error) {
        showNotification('Error copying JSON: ' + error.message, 'error');
    }
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
    
    if (!input) {
        validation.textContent = '';
        validation.className = 'validation-message';
        document.getElementById('jwt-header').textContent = '';
        document.getElementById('jwt-payload').textContent = '';
        document.getElementById('jwt-signature').textContent = '';
        return;
    }
    
    try {
        const parts = input.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
        }
        
        // Decode header
        const header = JSON.parse(atob(parts[0]));
        document.getElementById('jwt-header').innerHTML = formatJWTWithTooltips(header, 'header');
        
        // Decode payload
        const payload = JSON.parse(atob(parts[1]));
        document.getElementById('jwt-payload').innerHTML = formatJWTWithTooltips(payload, 'payload');
        
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

// Format JWT with tooltips for known fields
// Format JWT with tooltips for known fields
function formatJWTWithTooltips(obj, section) {
    const knownFields = {
        // Standard JWT claims
        'iss': 'Issuer - identifies the principal that issued the JWT',
        'sub': 'Subject - identifies the principal that is the subject of the JWT',
        'aud': 'Audience - identifies the recipients that the JWT is intended for',
        'exp': 'Expiration Time - identifies the expiration time on or after which the JWT must not be accepted',
        'nbf': 'Not Before - identifies the time before which the JWT must not be accepted',
        'iat': 'Issued At - identifies the time at which the JWT was issued',
        'jti': 'JWT ID - provides a unique identifier for the JWT',
        
        // Common header fields
        'alg': 'Algorithm - identifies the cryptographic algorithm used to secure the JWT',
        'typ': 'Type - declares the media type of the JWT',
        'kid': 'Key ID - hint indicating which key was used to secure the JWT',
        'cty': 'Content Type - declares the media type of the secured content',
        
        // Common custom claims
        'scope': 'Scope - space-separated list of scope values',
        'roles': 'Roles - user roles or permissions',
        'email': 'Email - user email address',
        'name': 'Name - user full name',
        'given_name': 'Given Name - user first name',
        'family_name': 'Family Name - user last name',
        'preferred_username': 'Preferred Username - shorthand name by which the user wishes to be referred'
    };
    
    const timestampFields = ['exp', 'nbf', 'iat'];
    
    let formatted = '{\n';
    const entries = Object.entries(obj);
    
    entries.forEach(([key, value], index) => {
        const isLast = index === entries.length - 1;
        const indent = '  ';
        
        // Check if value is an object or array (needs formatting)
        let valueStr;
        if (typeof value === 'object' && value !== null) {
            // Format nested objects/arrays with proper indentation
            valueStr = JSON.stringify(value, null, 2).split('\n').map((line, i) => 
                i === 0 ? line : '  ' + line
            ).join('\n');
        } else {
            valueStr = JSON.stringify(value);
        }
        
        let tooltip = '';
        
        // Add tooltip for known fields
        if (knownFields[key]) {
            tooltip = knownFields[key];
            
            // For timestamp fields, add human-readable date to tooltip
            if (timestampFields.includes(key) && typeof value === 'number') {
                const date = new Date(value * 1000);
                const humanReadable = date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short'
                });
                tooltip += '&#13;&#13;📅 ' + humanReadable;
            }
        }
        
        if (tooltip) {
            const escapedTooltip = tooltip.replace(/"/g, '&quot;');
            formatted += `${indent}<span class="jwt-field jwt-known-field" title="${escapedTooltip}">"${key}"</span>: ${valueStr}${isLast ? '' : ','}\n`;
        } else {
            // Non-standard claims: make bold but no tooltip
            formatted += `${indent}<span class="jwt-field">"${key}"</span>: ${valueStr}${isLast ? '' : ','}\n`;
        }
    });
    
    formatted += '}';
    return formatted;
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
    const compactUUID = uuid.replace(/-/g, '').toUpperCase();
    
    document.getElementById('uuid-output').value = uuid;
    document.getElementById('uuid-compact-output').value = compactUUID;
}

function generateMultipleUUIDs() {
    const uuids = [];
    const compactUUIDs = [];
    
    for (let i = 0; i < 10; i++) {
        const uuid = crypto.randomUUID();
        uuids.push(uuid);
        compactUUIDs.push(uuid.replace(/-/g, '').toUpperCase());
    }
    
    document.getElementById('uuid-output').value = uuids.join('\n');
    document.getElementById('uuid-compact-output').value = compactUUIDs.join('\n');
}

// Convert standard UUID to compact format
function convertToCompact() {
    const input = document.getElementById('uuid-output').value;
    if (!input.trim()) {
        document.getElementById('uuid-compact-output').value = '';
        return;
    }
    
    // Process line by line
    const lines = input.split('\n');
    const compactLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        // Remove hyphens and convert to uppercase
        return trimmed.replace(/-/g, '').toUpperCase();
    });
    
    document.getElementById('uuid-compact-output').value = compactLines.join('\n');
}

// Convert compact UUID to standard format
function convertToStandard() {
    const input = document.getElementById('uuid-compact-output').value;
    if (!input.trim()) {
        document.getElementById('uuid-output').value = '';
        return;
    }
    
    // Process line by line
    const lines = input.split('\n');
    const standardLines = lines.map(line => {
        const trimmed = line.trim().replace(/-/g, '').toLowerCase();
        if (!trimmed) return '';
        
        // Check if it's a valid 32-character hex string
        if (trimmed.length !== 32 || !/^[0-9a-f]{32}$/i.test(trimmed)) {
            return line; // Return original if invalid
        }
        
        // Insert hyphens at correct positions: 8-4-4-4-12
        return `${trimmed.substr(0, 8)}-${trimmed.substr(8, 4)}-${trimmed.substr(12, 4)}-${trimmed.substr(16, 4)}-${trimmed.substr(20, 12)}`;
    });
    
    document.getElementById('uuid-output').value = standardLines.join('\n');
}

// Timestamp Converter
function updateCurrentTime() {
    const now = new Date();
    const userLocale = navigator.language || 'en-US';
    
    document.getElementById('current-unix').value = Math.floor(now.getTime() / 1000);
    document.getElementById('current-unix-ms').value = now.getTime();
    document.getElementById('current-iso').value = now.toISOString();
    document.getElementById('current-locale').value = now.toLocaleString(userLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
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
        
        // Get browser locale
        const userLocale = navigator.language || 'en-US';
        
        output.innerHTML = `
            <div class="timestamp-section">
                <h4>Timestamps</h4>
                <strong>Unix Timestamp (seconds):</strong> ${Math.floor(date.getTime() / 1000)}<br>
                <strong>Unix Timestamp (milliseconds):</strong> ${date.getTime()}<br>
            </div>
            <div class="timestamp-section">
                <h4>Standard Formats</h4>
                <strong>ISO 8601:</strong> ${date.toISOString()}<br>
                <strong>UTC:</strong> ${date.toUTCString()}<br>
            </div>
            <div class="timestamp-section">
                <h4>Browser Locale (${userLocale})</h4>
                <strong>Full Date & Time:</strong> ${date.toLocaleString(userLocale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short'
                })}<br>
                <strong>Long Date:</strong> ${date.toLocaleDateString(userLocale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}<br>
                <strong>Short Date:</strong> ${date.toLocaleDateString(userLocale)}<br>
                <strong>Time:</strong> ${date.toLocaleTimeString(userLocale)}<br>
                <strong>Time (24h):</strong> ${date.toLocaleTimeString(userLocale, { hour12: false })}<br>
            </div>
            <div class="timestamp-section">
                <h4>Relative Time</h4>
                <strong>From Now:</strong> ${getRelativeTime(date)}
            </div>
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
        
        // Get browser locale
        const userLocale = navigator.language || 'en-US';
        
        output.innerHTML = `
            <div class="timestamp-section">
                <h4>Timestamps</h4>
                <strong>Unix Timestamp (seconds):</strong> ${Math.floor(date.getTime() / 1000)}<br>
                <strong>Unix Timestamp (milliseconds):</strong> ${date.getTime()}<br>
            </div>
            <div class="timestamp-section">
                <h4>Standard Formats</h4>
                <strong>ISO 8601:</strong> ${date.toISOString()}<br>
                <strong>UTC:</strong> ${date.toUTCString()}<br>
            </div>
            <div class="timestamp-section">
                <h4>Browser Locale (${userLocale})</h4>
                <strong>Full Date & Time:</strong> ${date.toLocaleString(userLocale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short'
                })}
            </div>
        `;
    } catch (error) {
        output.innerHTML = `<span style="color: var(--error-color);">Error: ${error.message}</span>`;
    }
}

// Helper function to get relative time
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffMs < 0) {
        // Future date
        const absDiffSec = Math.abs(diffSec);
        const absDiffMin = Math.abs(diffMin);
        const absDiffHour = Math.abs(diffHour);
        const absDiffDay = Math.abs(diffDay);
        const absDiffMonth = Math.abs(diffMonth);
        const absDiffYear = Math.abs(diffYear);
        
        if (absDiffSec < 60) return `in ${absDiffSec} second${absDiffSec !== 1 ? 's' : ''}`;
        if (absDiffMin < 60) return `in ${absDiffMin} minute${absDiffMin !== 1 ? 's' : ''}`;
        if (absDiffHour < 24) return `in ${absDiffHour} hour${absDiffHour !== 1 ? 's' : ''}`;
        if (absDiffDay < 30) return `in ${absDiffDay} day${absDiffDay !== 1 ? 's' : ''}`;
        if (absDiffMonth < 12) return `in ${absDiffMonth} month${absDiffMonth !== 1 ? 's' : ''}`;
        return `in ${absDiffYear} year${absDiffYear !== 1 ? 's' : ''}`;
    } else {
        // Past date
        if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
        if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
        if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
        if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
        return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
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
