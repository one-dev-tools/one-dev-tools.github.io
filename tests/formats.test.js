// Tests for Data Format tools
// Uses functions defined in app.js: getJSONType, formatXMLString, tokenizeSQL, validateSQL
// TODO (post-refactor): jsonToCSVLogic, csvToJSONLogic, yamlToJSONLogic, jsonToYAMLLogic
// will be testable once extracted from their DOM wrappers.

describe('getJSONType', () => {
    it('identifies null', ()  => expect(getJSONType(null)).toBe('null'));
    it('identifies array',()  => expect(getJSONType([])).toBe('array'));
    it('identifies object',() => expect(getJSONType({})).toBe('object'));
    it('identifies string',() => expect(getJSONType('x')).toBe('string'));
    it('identifies number',() => expect(getJSONType(42)).toBe('number'));
    it('identifies boolean',()=> expect(getJSONType(true)).toBe('boolean'));
});

describe('XML Formatter — formatXMLString', () => {
    const parse = xml => {
        const doc = new DOMParser().parseFromString(xml, 'text/xml');
        if (doc.querySelector('parsererror')) throw new Error('parse error');
        return doc;
    };

    it('indents a simple nested element', () => {
        const xml = '<root><child>value</child></root>';
        const out = formatXMLString(parse(xml), 2);
        expect(out).toContain('<root>');
        expect(out).toContain('  <child>');
        expect(out).toContain('  value');
        expect(out).toContain('  </child>');
    });
    it('places text node on its own line', () => {
        const xml = '<one><two>data</two></one>';
        const out = formatXMLString(parse(xml), 2);
        const lines = out.split('\n').map(l => l.trim()).filter(Boolean);
        const dataLine = lines.find(l => l === 'data');
        expect(dataLine).toBe('data');
    });
    it('respects custom indent size', () => {
        const xml = '<root><child/></root>';
        const out = formatXMLString(parse(xml), 4);
        expect(out).toContain('    <child');
    });
    it('handles self-closing tags without incrementing depth', () => {
        const xml = '<root><empty/><sibling>x</sibling></root>';
        const out = formatXMLString(parse(xml), 2);
        expect(out).toContain('  <empty');
        expect(out).toContain('  <sibling>');
    });
});

describe('SQL — tokenizeSQL', () => {
    it('identifies keywords', () => {
        const tokens = tokenizeSQL('SELECT id FROM users');
        expect(tokens.find(t => t.up === 'SELECT').type).toBe('keyword');
        expect(tokens.find(t => t.up === 'FROM').type).toBe('keyword');
    });
    it('identifies non-keyword words', () => {
        const tokens = tokenizeSQL('SELECT id FROM users');
        expect(tokens.find(t => t.val === 'id').type).toBe('word');
        expect(tokens.find(t => t.val === 'users').type).toBe('word');
    });
    it('tokenizes string literals as type string', () => {
        const tokens = tokenizeSQL("SELECT 'hello' FROM t");
        expect(tokens.find(t => t.type === 'string').val).toBe("'hello'");
    });
    it('tokenizes punctuation', () => {
        const tokens = tokenizeSQL('SELECT (id) FROM t');
        expect(tokens.find(t => t.val === '(').type).toBe('punct');
        expect(tokens.find(t => t.val === ')').type).toBe('punct');
    });
    it('skips whitespace — no whitespace tokens emitted', () => {
        const tokens = tokenizeSQL('SELECT   id   FROM   t');
        expect(tokens.every(t => t.val.trim() !== '')).toBeTruthy();
    });
    it('handles single-line comments', () => {
        const tokens = tokenizeSQL('SELECT id -- this is a comment\nFROM t');
        expect(tokens.some(t => t.type === 'comment')).toBeTruthy();
    });
});

describe('SQL — validateSQL (logic)', () => {
    // validateSQL reads from the DOM, so we stub getElementById for these tests
    const stub = (val) => {
        const orig = document.getElementById.bind(document);
        document.getElementById = (id) => {
            if (id === 'sql-input') return { value: val };
            if (id === 'sql-validation') return { textContent: '', className: '' };
            return orig(id);
        };
    };
    const restore = () => { document.getElementById = document.getElementById.__orig || document.getElementById; };

    const check = (sql) => {
        stub(sql);
        const r = validateSQL(false);
        return r;
    };

    it('accepts a valid SELECT', () => {
        expect(check('SELECT id, name FROM users').ok).toBeTruthy();
    });
    it('accepts SELECT *', () => {
        expect(check('SELECT * FROM users').ok).toBeTruthy();
    });
    it('accepts SELECT with WHERE', () => {
        expect(check('SELECT id FROM users WHERE id = 1').ok).toBeTruthy();
    });
    it('rejects unbalanced opening paren', () => {
        expect(check('SELECT (id FROM users').ok).toBeFalsy();
    });
    it('rejects unbalanced closing paren', () => {
        expect(check('SELECT id) FROM users').ok).toBeFalsy();
    });
    it('rejects missing comma in SELECT list', () => {
        expect(check('SELECT id name FROM users').ok).toBeFalsy();
    });
    it('rejects missing comma in ORDER BY list', () => {
        expect(check('SELECT id FROM users ORDER BY id name').ok).toBeFalsy();
    });
    it('accepts ORDER BY with ASC/DESC modifiers', () => {
        expect(check('SELECT id FROM users ORDER BY id ASC, name DESC').ok).toBeTruthy();
    });
    it('accepts function calls in SELECT', () => {
        expect(check('SELECT COUNT(id), name FROM users').ok).toBeTruthy();
    });
    it('rejects statement not starting with valid verb', () => {
        expect(check('FETCH id FROM users').ok).toBeFalsy();
    });
    it('accepts INSERT INTO', () => {
        expect(check("INSERT INTO users VALUES (1, 'Alice')").ok).toBeTruthy();
    });
    it('accepts multiple statements separated by semicolon', () => {
        expect(check('SELECT id FROM a; SELECT name FROM b').ok).toBeTruthy();
    });
});

describe('JSON ↔ CSV — logic', () => {
    // Test the CSV escape logic inline (mirrors app.js convertJSONtoCSV internals)
    const escape = val => {
        const str = val === null || val === undefined ? '' : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"` : str;
    };

    it('escapes values containing commas', () => {
        expect(escape('a,b')).toBe('"a,b"');
    });
    it('escapes values containing double quotes', () => {
        expect(escape('say "hi"')).toBe('"say ""hi"""');
    });
    it('leaves plain strings unquoted', () => {
        expect(escape('hello')).toBe('hello');
    });
    it('converts null to empty string', () => {
        expect(escape(null)).toBe('');
    });
    it('converts numbers to string', () => {
        expect(escape(42)).toBe('42');
    });
});
