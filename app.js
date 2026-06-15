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

    // Sub-tab navigation for merged tools
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    subTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subtabId = button.getAttribute('data-subtab');
            const parentTool = button.closest('.tool-panel');
            
            // Update active sub-tab button
            parentTool.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding sub-tab content
            parentTool.querySelectorAll('.sub-tab-content').forEach(content => content.classList.remove('active'));
            parentTool.querySelector(`#${subtabId}-tab`).classList.add('active');
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

// YAML Formatter
function formatYAML() {
    const input = document.getElementById('yaml-input').value;
    const indent = parseInt(document.getElementById('yaml-indent').value) || 2;
    const validation = document.getElementById('yaml-validation');

    try {
        const parsed = jsyaml.load(input);
        const formatted = jsyaml.dump(parsed, { indent });
        document.getElementById('yaml-output').value = formatted;
        validation.textContent = '✓ Valid YAML';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid YAML: ' + error.message;
        validation.className = 'validation-message error';
    }
}

function validateYAML() {
    const input = document.getElementById('yaml-input').value;
    const validation = document.getElementById('yaml-validation');

    try {
        jsyaml.load(input);
        validation.textContent = '✓ Valid YAML';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid YAML: ' + error.message;
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
// UUID Generator
function generateUUID() {
    const uuid = crypto.randomUUID();
    const compactUUID = uuid.replace(/-/g, '').toUpperCase();
    
    document.getElementById('uuid-output').value = uuid;
    document.getElementById('uuid-compact-output').value = compactUUID;
}

// Generate UUID v1 (Time-based)
function generateUUIDv1() {
    const now = Date.now();
    const timeHex = (now * 10000 + 0x01B21DD213814000).toString(16).padStart(16, '0');
    
    // Extract time components
    const timeLow = timeHex.substr(-8);
    const timeMid = timeHex.substr(-12, 4);
    const timeHi = '1' + timeHex.substr(-15, 3); // Version 1
    
    // Generate random clock sequence and node
    const clockSeq = crypto.getRandomValues(new Uint8Array(2));
    clockSeq[0] = (clockSeq[0] & 0x3f) | 0x80; // Set variant bits
    
    const node = crypto.getRandomValues(new Uint8Array(6));
    
    const uuid = [
        timeLow,
        timeMid,
        timeHi,
        Array.from(clockSeq).map(b => b.toString(16).padStart(2, '0')).join(''),
        Array.from(node).map(b => b.toString(16).padStart(2, '0')).join('')
    ].join('-');
    
    return uuid;
}

// Generate UUID v3 or v5 (Name-based)
async function generateNameBasedUUID(version, namespace, name) {
    const namespaceUUIDs = {
        'dns': '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        'url': '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        'oid': '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        'x500': '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
    };
    
    const namespaceUUID = namespaceUUIDs[namespace] || namespace;
    const namespaceBytes = namespaceUUID.replace(/-/g, '').match(/.{2}/g).map(h => parseInt(h, 16));
    const nameBytes = new TextEncoder().encode(name);
    
    // Combine namespace and name
    const data = new Uint8Array([...namespaceBytes, ...nameBytes]);
    
    // Hash the data
    const hashAlgorithm = version === 'v3' ? 'SHA-1' : 'SHA-256';
    const hashBuffer = await crypto.subtle.digest(hashAlgorithm, data);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Format as UUID
    const hex = Array.from(hashArray.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Set version and variant bits
    const versionBit = version === 'v3' ? '3' : '5';
    const uuid = [
        hex.substr(0, 8),
        hex.substr(8, 4),
        versionBit + hex.substr(13, 3),
        ((parseInt(hex.substr(16, 2), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hex.substr(18, 2),
        hex.substr(20, 12)
    ].join('-');
    
    return uuid;
}

// Toggle namespace input visibility
function toggleNamespaceInput() {
    const version = document.getElementById('uuid-version').value;
    const namespaceInput = document.getElementById('namespace-input');
    
    if (version === 'v3' || version === 'v5') {
        namespaceInput.style.display = 'flex';
    } else {
        namespaceInput.style.display = 'none';
    }
}

// Toggle custom namespace input
document.addEventListener('DOMContentLoaded', () => {
    const namespaceSelect = document.getElementById('uuid-namespace');
    const customNamespace = document.getElementById('custom-namespace');
    
    if (namespaceSelect) {
        namespaceSelect.addEventListener('change', () => {
            if (namespaceSelect.value === 'custom') {
                customNamespace.style.display = 'block';
            } else {
                customNamespace.style.display = 'none';
            }
        });
    }
});

// Generate UUID based on selected version
async function generateUUIDByVersion() {
    const version = document.getElementById('uuid-version').value;
    let uuid;
    
    try {
        if (version === 'v1') {
            uuid = generateUUIDv1();
        } else if (version === 'v4') {
            uuid = crypto.randomUUID();
        } else if (version === 'v3' || version === 'v5') {
            const namespaceSelect = document.getElementById('uuid-namespace').value;
            const namespace = namespaceSelect === 'custom' 
                ? document.getElementById('custom-namespace').value 
                : namespaceSelect;
            const name = document.getElementById('uuid-name').value;
            
            if (!name) {
                showNotification('Please enter a name for UUID generation', 'error');
                return;
            }
            
            if (namespaceSelect === 'custom' && !namespace) {
                showNotification('Please enter a custom namespace UUID', 'error');
                return;
            }
            
            uuid = await generateNameBasedUUID(version, namespace, name);
        }
        
        const compactUUID = uuid.replace(/-/g, '').toUpperCase();
        document.getElementById('uuid-output').value = uuid;
        document.getElementById('uuid-compact-output').value = compactUUID;
    } catch (error) {
        showNotification('Error generating UUID: ' + error.message, 'error');
    }
}

function generateMultipleUUIDs() {
    const version = document.getElementById('uuid-version').value;
    
    if (version === 'v3' || version === 'v5') {
        showNotification('Multiple UUID generation not supported for name-based UUIDs. Generate one at a time.', 'error');
        return;
    }
    
    const uuids = [];
    const compactUUIDs = [];
    
    for (let i = 0; i < 10; i++) {
        let uuid;
        if (version === 'v1') {
            uuid = generateUUIDv1();
        } else {
            uuid = crypto.randomUUID();
        }
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

// YAML ↔ JSON Converters
function convertYAMLtoJSON() {
    const input = document.getElementById('yaml-to-json-input').value;
    const indent = parseInt(document.getElementById('yaml-to-json-indent').value) || 2;
    const validation = document.getElementById('yaml-to-json-validation');

    try {
        const parsed = jsyaml.load(input);
        const json = JSON.stringify(parsed, null, indent);
        document.getElementById('yaml-to-json-output').value = json;
        validation.textContent = '✓ Converted successfully';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid YAML: ' + error.message;
        validation.className = 'validation-message error';
        document.getElementById('yaml-to-json-output').value = '';
    }
}

function convertJSONtoYAML() {
    const input = document.getElementById('json-to-yaml-input').value;
    const indent = parseInt(document.getElementById('json-to-yaml-indent').value) || 2;
    const validation = document.getElementById('json-to-yaml-validation');

    try {
        const parsed = JSON.parse(input);
        const yaml = jsyaml.dump(parsed, { indent });
        document.getElementById('json-to-yaml-output').value = yaml;
        validation.textContent = '✓ Converted successfully';
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Invalid JSON: ' + error.message;
        validation.className = 'validation-message error';
        document.getElementById('json-to-yaml-output').value = '';
    }
}

// JSON ↔ CSV Converter
function convertJSONtoCSV() {
    const input = document.getElementById('json-to-csv-input').value.trim();
    const validation = document.getElementById('json-to-csv-validation');

    try {
        const parsed = JSON.parse(input);
        const rows = Array.isArray(parsed) ? parsed : [parsed];

        if (rows.length === 0 || typeof rows[0] !== 'object' || rows[0] === null) {
            throw new Error('Input must be a JSON array of objects');
        }

        const headers = Array.from(
            rows.reduce((set, row) => { Object.keys(row).forEach(k => set.add(k)); return set; }, new Set())
        );

        const escape = val => {
            const str = val === null || val === undefined ? '' : String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"` : str;
        };

        const csv = [
            headers.map(escape).join(','),
            ...rows.map(row => headers.map(h => escape(row[h])).join(','))
        ].join('\n');

        document.getElementById('json-to-csv-output').value = csv;
        validation.textContent = `✓ Converted — ${rows.length} row${rows.length !== 1 ? 's' : ''}, ${headers.length} column${headers.length !== 1 ? 's' : ''}`;
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ ' + error.message;
        validation.className = 'validation-message error';
        document.getElementById('json-to-csv-output').value = '';
    }
}

function convertCSVtoJSON() {
    const input = document.getElementById('csv-to-json-input').value.trim();
    const validation = document.getElementById('csv-to-json-validation');

    try {
        if (!input) throw new Error('Input is empty');

        const parseCSVLine = line => {
            const result = [];
            let cur = '', inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (ch === '"') {
                    if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
                    else { inQuotes = !inQuotes; }
                } else if (ch === ',' && !inQuotes) {
                    result.push(cur); cur = '';
                } else {
                    cur += ch;
                }
            }
            result.push(cur);
            return result;
        };

        const lines = input.split('\n').filter(l => l.trim() !== '');
        if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            return Object.fromEntries(headers.map((h, i) => {
                const v = values[i] ?? '';
                const num = Number(v);
                return [h.trim(), v === '' ? '' : (!isNaN(num) && v.trim() !== '' ? num : v)];
            }));
        });

        document.getElementById('csv-to-json-output').value = JSON.stringify(rows, null, 2);
        validation.textContent = `✓ Converted — ${rows.length} row${rows.length !== 1 ? 's' : ''}, ${headers.length} column${headers.length !== 1 ? 's' : ''}`;
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ ' + error.message;
        validation.className = 'validation-message error';
        document.getElementById('csv-to-json-output').value = '';
    }
}

// Text Compare
function compareTexts() {
    const a = document.getElementById('compare-input-a').value;
    const b = document.getElementById('compare-input-b').value;
    const summaryEl = document.getElementById('diff-summary');
    const outputEl  = document.getElementById('diff-output');

    const linesA = a.split('\n');
    const linesB = b.split('\n');

    const diff = computeLineDiff(linesA, linesB);

    let added = 0, removed = 0;
    diff.forEach(d => { if (d.type === 'add') added++; else if (d.type === 'del') removed++; });

    if (added === 0 && removed === 0) {
        summaryEl.innerHTML = '';
        let html = '';
        linesA.forEach((line, i) => {
            html += diffLineHTML('identical', i + 1, i + 1, line);
        });
        outputEl.innerHTML = html;
        return;
    }

    summaryEl.innerHTML =
        `<span class="diff-stat-add">+${added} addition${added !== 1 ? 's' : ''}</span>` +
        `&ensp;<span class="diff-stat-del">−${removed} deletion${removed !== 1 ? 's' : ''}</span>`;

    const CONTEXT = 3;
    const changed = new Set();
    diff.forEach((d, i) => { if (d.type !== 'eq') { for (let j = Math.max(0, i - CONTEXT); j <= Math.min(diff.length - 1, i + CONTEXT); j++) changed.add(j); } });

    let html = '';
    let lineA = 1, lineB = 1, skipping = false;

    diff.forEach((d, i) => {
        if (!changed.has(i)) {
            if (!skipping) {
                html += `<div class="diff-separator">⋯ unchanged</div>`;
                skipping = true;
            }
            if (d.type === 'eq') { lineA++; lineB++; }
            return;
        }
        skipping = false;

        if (d.type === 'eq') {
            html += diffLineHTML('equal', lineA, lineB, d.text);
            lineA++; lineB++;
        } else if (d.type === 'del') {
            html += diffLineHTML('removed', lineA, '', d.text);
            lineA++;
        } else {
            html += diffLineHTML('added', '', lineB, d.text);
            lineB++;
        }
    });

    outputEl.innerHTML = html;
}

function diffLineHTML(type, numA, numB, text) {
    const num = type === 'added' ? numB : (type === 'removed' ? numA : numA);
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div class="diff-line ${type}"><span class="diff-line-num">${num}</span><span class="diff-line-content">${escaped}</span></div>`;
}

function computeLineDiff(a, b) {
    // Standard patience-style LCS diff via DP
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--)
        for (let j = n - 1; j >= 0; j--)
            dp[i][j] = a[i] === b[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);

    const result = [];
    let i = 0, j = 0;
    while (i < m || j < n) {
        if (i < m && j < n && a[i] === b[j]) {
            result.push({ type: 'eq',  text: a[i] }); i++; j++;
        } else if (j < n && (i >= m || dp[i][j+1] >= dp[i+1][j])) {
            result.push({ type: 'add', text: b[j] }); j++;
        } else {
            result.push({ type: 'del', text: a[i] }); i++;
        }
    }
    return result;
}

function clearCompare() {
    document.getElementById('compare-input-a').value = '';
    document.getElementById('compare-input-b').value = '';
    document.getElementById('diff-summary').innerHTML = '';
    document.getElementById('diff-output').innerHTML = '';
}

// String Case Converter
function toWords(input) {
    return input
        .replace(/([a-z])([A-Z])/g, '$1 $2')       // camelCase → words
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // ACRONYMWord → ACRONYM Word
        .replace(/[-_]+/g, ' ')                      // hyphens/underscores → space
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0);
}

function convertAllCases() {
    const input = document.getElementById('string-case-input').value;
    const words = toWords(input);

    if (words.length === 0) {
        ['camel','pascal','snake','kebab','constant','lower','upper','title'].forEach(id => {
            document.getElementById(`case-${id}`).value = '';
        });
        return;
    }

    document.getElementById('case-camel').value =
        words[0] + words.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join('');

    document.getElementById('case-pascal').value =
        words.map(w => w[0].toUpperCase() + w.slice(1)).join('');

    document.getElementById('case-snake').value =
        words.join('_');

    document.getElementById('case-kebab').value =
        words.join('-');

    document.getElementById('case-constant').value =
        words.join('_').toUpperCase();

    document.getElementById('case-lower').value =
        words.join(' ');

    document.getElementById('case-upper').value =
        words.join(' ').toUpperCase();

    document.getElementById('case-title').value =
        words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// SQL Formatter
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

function tokenizeSQL(sql) {
    const tokens = [];
    let i = 0;
    while (i < sql.length) {
        // Skip whitespace
        if (/\s/.test(sql[i])) { i++; continue; }
        // Single-line comment
        if (sql[i] === '-' && sql[i+1] === '-') {
            let j = i;
            while (j < sql.length && sql[j] !== '\n') j++;
            tokens.push({ type: 'comment', val: sql.slice(i, j) });
            i = j; continue;
        }
        // Block comment
        if (sql[i] === '/' && sql[i+1] === '*') {
            let j = i + 2;
            while (j < sql.length && !(sql[j-1] === '*' && sql[j] === '/')) j++;
            tokens.push({ type: 'comment', val: sql.slice(i, j+1) });
            i = j + 1; continue;
        }
        // String literal
        if (sql[i] === "'" || sql[i] === '"' || sql[i] === '`') {
            const q = sql[i]; let j = i + 1;
            while (j < sql.length && !(sql[j] === q && sql[j-1] !== '\\')) j++;
            tokens.push({ type: 'string', val: sql.slice(i, j+1) });
            i = j + 1; continue;
        }
        // Punctuation
        if (/[(),;*]/.test(sql[i])) {
            tokens.push({ type: 'punct', val: sql[i] }); i++; continue;
        }
        // Word / keyword
        if (/[\w.]/.test(sql[i])) {
            let j = i;
            while (j < sql.length && /[\w.]/.test(sql[j])) j++;
            const word = sql.slice(i, j);
            const up = word.toUpperCase();
            tokens.push({ type: SQL_KEYWORDS.includes(up) ? 'keyword' : 'word', val: word, up });
            i = j; continue;
        }
        tokens.push({ type: 'other', val: sql[i] }); i++;
    }
    return tokens;
}

// Keywords that start a new line
const NEWLINE_BEFORE = new Set([
    'SELECT','FROM','WHERE','AND','OR','JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN',
    'FULL JOIN','FULL OUTER JOIN','CROSS JOIN','GROUP BY','ORDER BY','HAVING',
    'LIMIT','OFFSET','UNION','UNION ALL','INTERSECT','EXCEPT','INSERT INTO',
    'VALUES','UPDATE','SET','DELETE FROM','ON','WITH','OVER','PARTITION BY'
]);

function validateSQL(standalone = false) {
    const input = document.getElementById('sql-input').value.trim();
    const validation = document.getElementById('sql-validation');

    if (!input) {
        validation.textContent = '';
        validation.className = 'validation-message';
        return { ok: false };
    }

    const errors = [];

    // 1. Unterminated string literals
    const strRe = /('([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`)/g;
    const stripped = input.replace(strRe, '""').replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    const unterm = stripped.match(/['"`]/);
    if (unterm) errors.push('Unterminated string literal');

    // 2. Unclosed block comment
    if (/\/\*/.test(stripped)) errors.push('Unclosed block comment');

    // 3. Unbalanced parentheses
    let depth = 0;
    for (const ch of stripped) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (depth < 0) { errors.push('Unexpected closing parenthesis'); break; }
    }
    if (depth > 0) errors.push(`${depth} unclosed parenthesis${depth > 1 ? 'es' : ''}`);

    // 4. Each semicolon-separated statement must start with a known DML/DDL verb
    const STMT_STARTERS = ['SELECT','INSERT','UPDATE','DELETE','CREATE','ALTER','DROP','WITH','TRUNCATE','MERGE','CALL','EXPLAIN','SHOW','DESCRIBE','GRANT','REVOKE'];
    const stmts = stripped.split(';').map(s => s.trim()).filter(s => s.length > 0);
    stmts.forEach((stmt, i) => {
        const first = stmt.replace(/\s+/g, ' ').trim().split(' ')[0].toUpperCase();
        if (!STMT_STARTERS.includes(first)) {
            errors.push(`Statement ${i + 1} starts with unexpected token "${first}"`);
        }
    });

    // 5. SELECT without FROM (unless it's SELECT <literal>, e.g. SELECT 1)
    stmts.forEach((stmt, i) => {
        const up = stmt.toUpperCase();
        if (up.startsWith('SELECT') && !/\bFROM\b/.test(up)) {
            // Allow SELECT of pure literals/expressions (no identifiers with dots or bare words after SELECT)
            const afterSelect = up.replace(/^SELECT\s+/, '');
            if (/[A-Z_][A-Z0-9_.]*\s*(?:,|\s+[A-Z])/.test(afterSelect)) {
                errors.push(`Statement ${i + 1}: SELECT references columns but has no FROM clause`);
            }
        }
    });

    // 6. SELECT column list — items must be separated by commas
    stmts.forEach((stmt, stmtIdx) => {
        const tokens = tokenizeSQL(stmt);
        const selectIdx = tokens.findIndex(t => t.up === 'SELECT');
        if (selectIdx === -1) return;

        // Start after SELECT (skip optional DISTINCT)
        let start = selectIdx + 1;
        if (tokens[start] && tokens[start].up === 'DISTINCT') start++;

        // Collect tokens up to FROM (depth 0), ignoring subqueries in parens
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
        if (colTokens.length === 1 && colTokens[0].val === '*') return; // SELECT *

        // Walk the flat (depth-0) token stream and check separators.
        // Between two consecutive value-tokens at depth 0 there must be a comma.
        // Value-tokens: words, strings, *, numbers; skip keywords used as modifiers (AS, ASC, DESC).
        const SKIP_KW = new Set(['AS','ASC','DESC','DISTINCT']);
        let expectComma = false;
        let flatDepth = 0;

        for (const t of colTokens) {
            if (t.type === 'punct' && t.val === '(') { flatDepth++; continue; }
            if (t.type === 'punct' && t.val === ')') { flatDepth--; continue; }
            if (flatDepth > 0) continue; // inside subexpr / function call

            if (t.type === 'punct' && t.val === ',') {
                expectComma = false;
                continue;
            }

            // Operators and other punctuation are part of an expression — don't flip state
            if (t.type === 'other') continue;

            // Modifier keywords that don't start a new column
            if (t.type === 'keyword' && SKIP_KW.has(t.up)) continue;

            // Anything else (word, string, keyword used as value like NULL/TRUE)
            if (expectComma) {
                errors.push(`Statement ${stmtIdx + 1}: missing comma in SELECT column list before "${t.val}"`);
                break;
            }
            expectComma = true;
        }
    });

    // 7. ORDER BY list — items must be separated by commas
    const ORDER_BY_TERMINATORS = new Set(['LIMIT','OFFSET','UNION','UNION ALL','INTERSECT','EXCEPT','HAVING']);
    const ORDER_BY_SKIP = new Set(['ASC','DESC','NULLS','FIRST','LAST']);

    stmts.forEach((stmt, stmtIdx) => {
        const tokens = tokenizeSQL(stmt);

        // Find ORDER BY — it's two consecutive keyword tokens
        let orderByIdx = -1;
        for (let i = 0; i < tokens.length - 1; i++) {
            if (tokens[i].up === 'ORDER' && tokens[i + 1].up === 'BY') {
                orderByIdx = i + 2; // start after BY
                break;
            }
        }
        if (orderByIdx === -1) return;

        // Collect tokens until a top-level terminator or end of statement
        const orderTokens = [];
        let d = 0;
        for (let i = orderByIdx; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === 'punct' && t.val === '(') { d++; orderTokens.push(t); continue; }
            if (t.type === 'punct' && t.val === ')') { d--; orderTokens.push(t); continue; }
            if (d === 0 && t.type === 'keyword' && ORDER_BY_TERMINATORS.has(t.up)) break;
            orderTokens.push(t);
        }

        if (orderTokens.length === 0) {
            errors.push(`Statement ${stmtIdx + 1}: ORDER BY has no columns`);
            return;
        }

        let expectComma = false;
        let flatDepth = 0;

        for (const t of orderTokens) {
            if (t.type === 'punct' && t.val === '(') { flatDepth++; continue; }
            if (t.type === 'punct' && t.val === ')') { flatDepth--; continue; }
            if (flatDepth > 0) continue;

            if (t.type === 'punct' && t.val === ',') { expectComma = false; continue; }
            if (t.type === 'other') continue;
            if (t.type === 'keyword' && ORDER_BY_SKIP.has(t.up)) continue;

            if (expectComma) {
                errors.push(`Statement ${stmtIdx + 1}: missing comma in ORDER BY list before "${t.val}"`);
                break;
            }
            expectComma = true;
        }
    });
        validation.textContent = '✗ ' + errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} more)` : '');
        validation.className = 'validation-message error';
        return { ok: false, errors };
    }

    if (standalone) {
        validation.textContent = `✓ Valid SQL — ${stmts.length} statement${stmts.length !== 1 ? 's' : ''}`;
        validation.className = 'validation-message success';
    }

    return { ok: true, stmts: stmts.length };
}

function formatSQL() {
    const input = document.getElementById('sql-input').value.trim();
    const validation = document.getElementById('sql-validation');

    if (!input) {
        validation.textContent = '';
        validation.className = 'validation-message';
        return;
    }

    const check = validateSQL(false);
    if (!check.ok) return; // validation message already set

    try {
        const tokens = tokenizeSQL(input);
        let out = '', indent = 0, col = 0;

        const nl = (extra = 0) => {
            out += '\n' + '  '.repeat(indent + extra);
            col = (indent + extra) * 2;
        };

        tokens.forEach((tok, idx) => {
            const up = tok.up || tok.val.toUpperCase();
            const prev = idx > 0 ? tokens[idx - 1] : null;

            if (tok.type === 'punct' && tok.val === '(') {
                out += '('; col++; indent++;
            } else if (tok.type === 'punct' && tok.val === ')') {
                indent = Math.max(0, indent - 1);
                nl(); out += ')'; col++;
            } else if (tok.type === 'punct' && tok.val === ',') {
                out += ','; nl();
            } else if (tok.type === 'punct' && tok.val === ';') {
                out += ';'; nl();
            } else if (tok.type === 'keyword' && NEWLINE_BEFORE.has(up)) {
                if (out.length > 0) nl();
                out += up; col += up.length;
            } else if (tok.type === 'keyword') {
                if (prev && prev.type !== 'punct') { out += ' '; col++; }
                out += up; col += up.length;
            } else {
                if (prev && prev.type !== 'punct' && prev.val !== '(') { out += ' '; col++; }
                out += tok.val; col += tok.val.length;
            }
        });

        document.getElementById('sql-output').value = out.trim();
        const stmtCount = check.stmts || 1;
        validation.textContent = `✓ Valid SQL — ${stmtCount} statement${stmtCount !== 1 ? 's' : ''}`;
        validation.className = 'validation-message success';
    } catch (error) {
        validation.textContent = '✗ Error: ' + error.message;
        validation.className = 'validation-message error';
    }
}

function minifySQL() {
    const input = document.getElementById('sql-input').value.trim();
    const validation = document.getElementById('sql-validation');

    if (!input) return;

    const check = validateSQL(false);
    if (!check.ok) return;

    const tokens = tokenizeSQL(input);
    let out = '';
    tokens.forEach((tok, idx) => {
        const prev = idx > 0 ? tokens[idx - 1] : null;
        const up = tok.up || tok.val.toUpperCase();
        const val = tok.type === 'keyword' ? up : tok.val;
        const needsSpace = prev && prev.val !== '(' && tok.val !== ')' && tok.val !== ',' && tok.val !== ';' && tok.val !== '(';
        out += (needsSpace ? ' ' : '') + val;
    });

    document.getElementById('sql-output').value = out.trim();
    const stmtCount = check.stmts || 1;
    validation.textContent = `✓ Valid SQL — minified, ${stmtCount} statement${stmtCount !== 1 ? 's' : ''}`;
    validation.className = 'validation-message success';
}