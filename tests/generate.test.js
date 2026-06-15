// Tests for Generate tools: UUID, Hash (via CryptoJS), Timestamp, Color

describe('UUID v1 — generateUUIDv1', () => {
    it('returns a string', () => {
        expect(typeof generateUUIDv1()).toBe('string');
    });
    it('matches UUID format (8-4-4-4-12)', () => {
        expect(generateUUIDv1()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
    it('has version bit 1', () => {
        const uuid = generateUUIDv1();
        expect(uuid.split('-')[2][0]).toBe('1');
    });
    it('generates unique values', () => {
        const a = generateUUIDv1(), b = generateUUIDv1();
        expect(a === b).toBeFalsy();
    });
});

describe('UUID v4 — crypto.randomUUID', () => {
    it('matches UUID v4 format', () => {
        expect(crypto.randomUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
    it('has version bit 4', () => {
        expect(crypto.randomUUID().split('-')[2][0]).toBe('4');
    });
    it('generates unique values', () => {
        expect(crypto.randomUUID() === crypto.randomUUID()).toBeFalsy();
    });
});

describe('UUID v5 — generateNameBasedUUID', () => {
    it('returns a promise that resolves to a UUID string', async () => {
        const uuid = await generateNameBasedUUID('v5', 'dns', 'example.com');
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
    it('is deterministic — same input, same output', async () => {
        const a = await generateNameBasedUUID('v5', 'dns', 'example.com');
        const b = await generateNameBasedUUID('v5', 'dns', 'example.com');
        expect(a).toBe(b);
    });
    it('differs for different names', async () => {
        const a = await generateNameBasedUUID('v5', 'dns', 'example.com');
        const b = await generateNameBasedUUID('v5', 'dns', 'other.com');
        expect(a === b).toBeFalsy();
    });
});

describe('Relative time — getRelativeTime', () => {
    const past   = (ms) => new Date(Date.now() - ms);
    const future = (ms) => new Date(Date.now() + ms);

    it('formats seconds ago', () => {
        expect(getRelativeTime(past(30_000))).toContain('second');
    });
    it('formats minutes ago', () => {
        expect(getRelativeTime(past(3 * 60_000))).toContain('minute');
    });
    it('formats hours ago', () => {
        expect(getRelativeTime(past(5 * 3_600_000))).toContain('hour');
    });
    it('formats days ago', () => {
        expect(getRelativeTime(past(3 * 86_400_000))).toContain('day');
    });
    it('formats future seconds', () => {
        expect(getRelativeTime(future(30_000))).toMatch(/^in \d+ second/);
    });
    it('formats future minutes', () => {
        expect(getRelativeTime(future(5 * 60_000))).toMatch(/^in \d+ minute/);
    });
    it('uses plural for values > 1', () => {
        expect(getRelativeTime(past(2 * 60_000))).toContain('minutes');
    });
    it('uses singular for 1', () => {
        expect(getRelativeTime(past(61_000))).toBe('1 minute ago');
    });
});

describe('Color — hexToRgb', () => {
    it('parses a standard 6-digit hex', () => {
        expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });
    it('parses lowercase hex', () => {
        expect(hexToRgb('#3498db')).toEqual({ r: 52, g: 152, b: 219 });
    });
    it('returns null for invalid input', () => {
        expect(hexToRgb('notacolor')).toBeNull();
    });
});

describe('Color — rgbToHex', () => {
    it('converts red', () => {
        expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
    });
    it('converts black', () => {
        expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });
    it('converts white', () => {
        expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
    });
    it('round-trips with hexToRgb', () => {
        const { r, g, b } = hexToRgb('#3498db');
        expect(rgbToHex(r, g, b)).toBe('#3498DB');
    });
});

describe('Color — rgbToHsl', () => {
    it('converts red correctly', () => {
        expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    });
    it('converts white correctly', () => {
        expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
    });
    it('converts black correctly', () => {
        expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
    });
});

describe('Color — hslToHex', () => {
    it('converts red HSL to hex', () => {
        expect(hslToHex(0, 100, 50)).toBe('#FF0000');
    });
    it('converts white', () => {
        expect(hslToHex(0, 0, 100)).toBe('#FFFFFF');
    });
    it('round-trips with rgbToHsl + hexToRgb', () => {
        // rgbToHsl rounds to integer HSL values, so the round-trip is lossy by 1 channel.
        // The correct expected value is what hslToHex(rgbToHsl(hex)) actually produces.
        const hex = '#3498DB';
        const { r, g, b } = hexToRgb(hex);
        const { h, s, l } = rgbToHsl(r, g, b);
        expect(hslToHex(h, s, l)).toBe('#3398DB'); // lossy round-trip due to integer HSL rounding
    });
});
