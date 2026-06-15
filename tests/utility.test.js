// Tests for Utility tools: Text Compare, String Case, Regex, Markdown

describe('computeLineDiff', () => {
    it('returns all equal for identical inputs', () => {
        const diff = computeLineDiff(['a', 'b', 'c'], ['a', 'b', 'c']);
        expect(diff.every(d => d.type === 'eq')).toBeTruthy();
    });
    it('detects a single added line', () => {
        const diff = computeLineDiff(['a', 'b'], ['a', 'x', 'b']);
        expect(diff.some(d => d.type === 'add' && d.text === 'x')).toBeTruthy();
    });
    it('detects a single deleted line', () => {
        const diff = computeLineDiff(['a', 'x', 'b'], ['a', 'b']);
        expect(diff.some(d => d.type === 'del' && d.text === 'x')).toBeTruthy();
    });
    it('handles completely different inputs', () => {
        const diff = computeLineDiff(['a', 'b'], ['c', 'd']);
        expect(diff.filter(d => d.type === 'del').length).toBe(2);
        expect(diff.filter(d => d.type === 'add').length).toBe(2);
    });
    it('handles empty left side (all additions)', () => {
        const diff = computeLineDiff([], ['a', 'b']);
        expect(diff.every(d => d.type === 'add')).toBeTruthy();
    });
    it('handles empty right side (all deletions)', () => {
        const diff = computeLineDiff(['a', 'b'], []);
        expect(diff.every(d => d.type === 'del')).toBeTruthy();
    });
    it('returns empty for two empty inputs', () => {
        expect(computeLineDiff([], [])).toHaveLength(0);
    });
});

describe('String Case — toWords', () => {
    it('splits on spaces', () => {
        expect(toWords('hello world')).toEqual(['hello', 'world']);
    });
    it('splits on underscores', () => {
        expect(toWords('hello_world')).toEqual(['hello', 'world']);
    });
    it('splits on hyphens', () => {
        expect(toWords('hello-world')).toEqual(['hello', 'world']);
    });
    it('splits camelCase', () => {
        expect(toWords('helloWorld')).toEqual(['hello', 'world']);
    });
    it('splits PascalCase', () => {
        expect(toWords('HelloWorld')).toEqual(['hello', 'world']);
    });
    it('splits SCREAMING_SNAKE_CASE', () => {
        expect(toWords('HELLO_WORLD')).toEqual(['hello', 'world']);
    });
    it('handles mixed delimiters', () => {
        expect(toWords('hello-world_foo')).toEqual(['hello', 'world', 'foo']);
    });
    it('returns empty array for empty input', () => {
        expect(toWords('')).toHaveLength(0);
    });
    it('trims leading/trailing whitespace', () => {
        expect(toWords('  hello  ')).toEqual(['hello']);
    });
});

describe('String Case — case conversions', () => {
    // Mirror the conversion logic from convertAllCases()
    const words = (s) => toWords(s);

    const camel    = s => { const w = words(s); return w[0] + w.slice(1).map(x => x[0].toUpperCase() + x.slice(1)).join(''); };
    const pascal   = s => words(s).map(w => w[0].toUpperCase() + w.slice(1)).join('');
    const snake    = s => words(s).join('_');
    const kebab    = s => words(s).join('-');
    const constant = s => words(s).join('_').toUpperCase();
    const lower    = s => words(s).join(' ');
    const upper    = s => words(s).join(' ').toUpperCase();
    const title    = s => words(s).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

    it('camelCase', () => expect(camel('hello world')).toBe('helloWorld'));
    it('PascalCase', () => expect(pascal('hello world')).toBe('HelloWorld'));
    it('snake_case', () => expect(snake('hello world')).toBe('hello_world'));
    it('kebab-case', () => expect(kebab('hello world')).toBe('hello-world'));
    it('CONSTANT_CASE', () => expect(constant('hello world')).toBe('HELLO_WORLD'));
    it('lowercase', () => expect(lower('HELLO WORLD')).toBe('hello world'));
    it('UPPERCASE', () => expect(upper('hello world')).toBe('HELLO WORLD'));
    it('Title Case', () => expect(title('hello world')).toBe('Hello World'));

    it('camelCase from snake_case input', () => expect(camel('hello_world_foo')).toBe('helloWorldFoo'));
    it('PascalCase from kebab input', () => expect(pascal('my-component-name')).toBe('MyComponentName'));
    it('snake_case from camelCase input', () => expect(snake('helloWorldFoo')).toBe('hello_world_foo'));
});

describe('escapeHtml', () => {
    it('escapes &', () => expect(escapeHtml('a & b')).toBe('a &amp; b'));
    it('escapes <', () => expect(escapeHtml('<div>')).toBe('&lt;div&gt;'));
    it('escapes >', () => expect(escapeHtml('a > b')).toBe('a &gt; b'));
    it('leaves plain text unchanged', () => expect(escapeHtml('hello')).toBe('hello'));
    it('handles empty string', () => expect(escapeHtml('')).toBe(''));
    it('escapes multiple special chars', () => {
        expect(escapeHtml('<b>a & b</b>')).toBe('&lt;b&gt;a &amp; b&lt;/b&gt;');
    });
});

describe('parseMarkdown', () => {
    it('renders h1', () => expect(parseMarkdown('# Hello')).toContain('<h1>Hello</h1>'));
    it('renders h2', () => expect(parseMarkdown('## Hello')).toContain('<h2>Hello</h2>'));
    it('renders h3', () => expect(parseMarkdown('### Hello')).toContain('<h3>Hello</h3>'));
    it('renders bold', () => expect(parseMarkdown('**bold**')).toContain('<strong>bold</strong>'));
    it('renders italic', () => expect(parseMarkdown('*italic*')).toContain('<em>italic</em>'));
    it('renders strikethrough', () => expect(parseMarkdown('~~del~~')).toContain('<del>del</del>'));
    it('renders inline code', () => expect(parseMarkdown('`code`')).toContain('<code>code</code>'));
    it('renders a link', () => {
        expect(parseMarkdown('[click](https://example.com)')).toContain('<a href="https://example.com"');
    });
    it('renders an image', () => {
        expect(parseMarkdown('![alt](img.png)')).toContain('<img src="img.png" alt="alt">');
    });
    it('renders unordered list', () => {
        const out = parseMarkdown('- one\n- two');
        expect(out).toContain('<ul>');
        expect(out).toContain('<li>one</li>');
    });
    it('renders ordered list', () => {
        const out = parseMarkdown('1. first\n2. second');
        expect(out).toContain('<ol>');
        expect(out).toContain('<li>first</li>');
    });
    it('renders blockquote', () => {
        expect(parseMarkdown('> quoted')).toContain('<blockquote>');
    });
    it('renders horizontal rule', () => {
        expect(parseMarkdown('---')).toContain('<hr>');
    });
    it('renders fenced code block', () => {
        const out = parseMarkdown('```\nconst x = 1;\n```');
        expect(out).toContain('<pre><code>');
    });
    it('renders a table', () => {
        const md = '| A | B |\n|---|---|\n| 1 | 2 |';
        const out = parseMarkdown(md);
        expect(out).toContain('<table>');
        expect(out).toContain('<th>');
        expect(out).toContain('<td>');
    });
    it('returns empty string for empty input', () => {
        expect(parseMarkdown('')).toBe('');
    });
});
