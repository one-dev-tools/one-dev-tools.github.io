// ── URL Encoder / Decoder ─────────────────────────────────

function encodeURL() {
    const input = document.getElementById('url-input').value;
    try {
        document.getElementById('url-output').value = encodeURIComponent(input);
    } catch (e) {
        showNotification('Encoding error: ' + e.message, 'error');
    }
}

function decodeURL() {
    const input = document.getElementById('url-input').value;
    try {
        document.getElementById('url-output').value = decodeURIComponent(input);
    } catch (e) {
        showNotification('Decoding error: ' + e.message, 'error');
    }
}

// ── Base64 Encoder / Decoder ──────────────────────────────

function encodeBase64() {
    const input = document.getElementById('base64-input').value;
    try {
        document.getElementById('base64-output').value = btoa(unescape(encodeURIComponent(input)));
    } catch (e) {
        showNotification('Encoding error: ' + e.message, 'error');
    }
}

function decodeBase64() {
    const input = document.getElementById('base64-input').value;
    try {
        document.getElementById('base64-output').value = decodeURIComponent(escape(atob(input)));
    } catch (e) {
        showNotification('Decoding error: ' + e.message, 'error');
    }
}

// ── JWT Decoder ───────────────────────────────────────────

function decodeJWT() {
    const input      = document.getElementById('jwt-input').value.trim();
    const validation = document.getElementById('jwt-validation');

    if (!input) {
        validation.textContent = '';
        validation.className   = 'validation-message';
        ['jwt-header','jwt-payload','jwt-signature'].forEach(id => {
            document.getElementById(id).textContent = '';
        });
        return;
    }

    try {
        const parts = input.split('.');
        if (parts.length !== 3) throw new Error('JWT must have 3 parts separated by dots.');

        document.getElementById('jwt-header').innerHTML    = formatJWTWithTooltips(JSON.parse(atob(parts[0])));
        document.getElementById('jwt-payload').innerHTML   = formatJWTWithTooltips(JSON.parse(atob(parts[1])));
        document.getElementById('jwt-signature').textContent = parts[2];

        validation.textContent = '✓ JWT decoded successfully';
        validation.className   = 'validation-message success';
    } catch (e) {
        validation.textContent = '✗ Invalid JWT: ' + e.message;
        validation.className   = 'validation-message error';
        ['jwt-header','jwt-payload','jwt-signature'].forEach(id => {
            document.getElementById(id).textContent = '';
        });
    }
}

function formatJWTWithTooltips(obj) {
    const knownFields = {
        iss: 'Issuer - identifies the principal that issued the JWT',
        sub: 'Subject - identifies the principal that is the subject of the JWT',
        aud: 'Audience - identifies the recipients that the JWT is intended for',
        exp: 'Expiration Time - identifies the expiration time on or after which the JWT must not be accepted',
        nbf: 'Not Before - identifies the time before which the JWT must not be accepted',
        iat: 'Issued At - identifies the time at which the JWT was issued',
        jti: 'JWT ID - provides a unique identifier for the JWT',
        alg: 'Algorithm - identifies the cryptographic algorithm used to secure the JWT',
        typ: 'Type - declares the media type of the JWT',
        kid: 'Key ID - hint indicating which key was used to secure the JWT',
        cty: 'Content Type - declares the media type of the secured content',
        scope: 'Scope - space-separated list of scope values',
        roles: 'Roles - user roles or permissions',
        email: 'Email - user email address',
        name:  'Name - user full name',
        given_name:         'Given Name - user first name',
        family_name:        'Family Name - user last name',
        preferred_username: 'Preferred Username - shorthand name by which the user wishes to be referred'
    };
    const timestampFields = ['exp','nbf','iat'];

    let out = '{\n';
    const entries = Object.entries(obj);
    entries.forEach(([key, value], idx) => {
        const isLast = idx === entries.length - 1;
        let valueStr = typeof value === 'object' && value !== null
            ? JSON.stringify(value, null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')
            : JSON.stringify(value);

        let tooltip = knownFields[key] || '';
        if (tooltip && timestampFields.includes(key) && typeof value === 'number') {
            const d = new Date(value * 1000).toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
            });
            tooltip += '&#13;&#13;📅 ' + d;
        }

        if (tooltip) {
            out += `  <span class="jwt-field jwt-known-field" title="${tooltip.replace(/"/g,'&quot;')}">"${key}"</span>: ${valueStr}${isLast ? '' : ','}\n`;
        } else {
            out += `  <span class="jwt-field">"${key}"</span>: ${valueStr}${isLast ? '' : ','}\n`;
        }
    });
    out += '}';
    return out;
}
