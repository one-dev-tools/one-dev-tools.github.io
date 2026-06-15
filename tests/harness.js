// Minimal test harness — no dependencies, runs in browser or Node
const results = { passed: 0, failed: 0, suites: [] };
let currentSuite = null;

function describe(name, fn) {
    currentSuite = { name, tests: [] };
    results.suites.push(currentSuite);
    try { fn(); } catch (e) { currentSuite.tests.push({ name: '(suite setup)', ok: false, error: e.message }); }
    currentSuite = null;
}

function it(name, fn) {
    const entry = { name, ok: false, error: null };
    if (currentSuite) currentSuite.tests.push(entry);
    try {
        fn();
        entry.ok = true;
        results.passed++;
    } catch (e) {
        entry.error = e.message;
        results.failed++;
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected)
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        },
        toEqual(expected) {
            const a = JSON.stringify(actual), b = JSON.stringify(expected);
            if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
        },
        toContain(substr) {
            if (!String(actual).includes(substr))
                throw new Error(`Expected "${actual}" to contain "${substr}"`);
        },
        toMatch(re) {
            if (!re.test(String(actual)))
                throw new Error(`Expected "${actual}" to match ${re}`);
        },
        toBeTruthy() {
            if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
        },
        toBeFalsy() {
            if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
        },
        toBeNull() {
            if (actual !== null) throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
        },
        toHaveLength(n) {
            if (actual.length !== n)
                throw new Error(`Expected length ${n}, got ${actual.length}`);
        },
        toThrow() {
            if (typeof actual !== 'function') throw new Error('toThrow requires a function');
            try { actual(); throw new Error('Expected function to throw, but it did not'); }
            catch (e) { if (e.message.startsWith('Expected function')) throw e; }
        }
    };
}

function renderResults() {
    const root = document.getElementById('results');
    if (!root) return;

    const total = results.passed + results.failed;
    const summaryClass = results.failed === 0 ? 'summary pass' : 'summary fail';
    let html = `<div class="${summaryClass}">${results.passed} / ${total} passed${results.failed > 0 ? ` — ${results.failed} failed` : ''}</div>`;

    results.suites.forEach(suite => {
        const suitePass = suite.tests.every(t => t.ok);
        html += `<details ${suitePass ? '' : 'open'}><summary class="${suitePass ? 'suite-pass' : 'suite-fail'}">${suite.name}</summary><ul>`;
        suite.tests.forEach(t => {
            html += `<li class="${t.ok ? 'test-pass' : 'test-fail'}">
                ${t.ok ? '✓' : '✗'} ${t.name}
                ${t.error ? `<span class="err">${t.error}</span>` : ''}
            </li>`;
        });
        html += '</ul></details>';
    });

    root.innerHTML = html;
}
