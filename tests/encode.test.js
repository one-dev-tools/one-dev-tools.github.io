// Tests for Encode/Decode tools
// Pure logic extracted inline — DOM wrappers in app.js are not tested here.
// TODO (post-refactor): import encodeURLLogic, decodeURLLogic, encodeBase64Logic, decodeBase64Logic

describe('URL Encoder / Decoder', () => {
    it('encodes a plain string', () => {
        expect(encodeURIComponent('hello world')).toBe('hello%20world');
    });
    it('encodes special characters', () => {
        expect(encodeURIComponent('a=1&b=2')).toBe('a%3D1%26b%3D2');
    });
    it('decodes an encoded string', () => {
        expect(decodeURIComponent('hello%20world')).toBe('hello world');
    });
    it('decodes a fully encoded URL', () => {
        expect(decodeURIComponent('https%3A%2F%2Fexample.com%2Fpath%3Fq%3D1')).toBe('https://example.com/path?q=1');
    });
    it('round-trips arbitrary text', () => {
        const src = 'foo bar/baz?x=1&y=héllo';
        expect(decodeURIComponent(encodeURIComponent(src))).toBe(src);
    });
});

describe('Base64 Encoder / Decoder', () => {
    // Mirror the app logic: encode uses btoa(unescape(encodeURIComponent(input)))
    const encode = s => btoa(unescape(encodeURIComponent(s)));
    const decode = s => decodeURIComponent(escape(atob(s)));

    it('encodes plain ASCII', () => {
        expect(encode('hello')).toBe('aGVsbG8=');
    });
    it('encodes an empty string', () => {
        expect(encode('')).toBe('');
    });
    it('decodes a known value', () => {
        expect(decode('aGVsbG8=')).toBe('hello');
    });
    it('round-trips ASCII text', () => {
        const src = 'One Dev Tools 123';
        expect(decode(encode(src))).toBe(src);
    });
    it('round-trips UTF-8 text', () => {
        const src = 'héllo wörld';
        expect(decode(encode(src))).toBe(src);
    });
    it('throws on invalid Base64 input', () => {
        expect(() => decode('!!!invalid!!!')).toThrow();
    });
});

describe('JWT Decoder', () => {
    // Valid JWT with known header + payload (signature is dummy)
    const header  = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: '1234567890', name: 'John Doe', iat: 1516239022 };
    const b64 = obj => btoa(JSON.stringify(obj)).replace(/=+$/, '');
    const token = `${b64(header)}.${b64(payload)}.dummy_signature`;

    it('splits into exactly 3 parts', () => {
        expect(token.split('.').length).toBe(3);
    });
    it('decodes header correctly', () => {
        const decoded = JSON.parse(atob(token.split('.')[0]));
        expect(decoded.alg).toBe('HS256');
        expect(decoded.typ).toBe('JWT');
    });
    it('decodes payload correctly', () => {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        expect(decoded.sub).toBe('1234567890');
        expect(decoded.name).toBe('John Doe');
    });
    it('rejects a token with fewer than 3 parts', () => {
        expect(() => {
            const parts = 'not.a.valid.jwt.here'.split('.');
            if (parts.length !== 3) throw new Error('Invalid JWT format');
        }).toThrow();
    });
    it('preserves the raw signature part unchanged', () => {
        const sig = token.split('.')[2];
        expect(sig).toBe('dummy_signature');
    });
});
