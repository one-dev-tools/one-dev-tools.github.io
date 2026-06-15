// Tool Navigation
document.addEventListener('DOMContentLoaded', () => {
    const toolButtons = document.querySelectorAll('.tool-btn');
    const toolPanels  = document.querySelectorAll('.tool-panel');

    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolId = button.getAttribute('data-tool');
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            toolPanels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(toolId).classList.add('active');
        });
    });

    // Sub-tab navigation
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    subTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subtabId  = button.getAttribute('data-subtab');
            const parentTool = button.closest('.tool-panel');
            parentTool.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            parentTool.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
            parentTool.querySelector(`#${subtabId}-tab`).classList.add('active');
        });
    });

    // Initialize timestamp converter
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Initialize color converter
    convertColor();
});

// ── Shared utilities ──────────────────────────────────────

function clearInput(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = '';
        else el.innerHTML = '';
    });
}

function copyToClipboard(elementId) {
    const el   = document.getElementById(elementId);
    const text = el.value || el.innerText;
    navigator.clipboard.writeText(text)
        .then(() => showNotification('Copied to clipboard!', 'success'))
        .catch(() => showNotification('Failed to copy', 'error'));
}

function copyToClipboardFromInput(elementId) {
    const el = document.getElementById(elementId);
    el.select();
    navigator.clipboard.writeText(el.value)
        .then(() => showNotification('Copied to clipboard!', 'success'))
        .catch(() => showNotification('Failed to copy', 'error'));
}

function showNotification(message, type) {
    const n = document.createElement('div');
    n.className = `validation-message ${type}`;
    n.textContent = message;
    Object.assign(n.style, {
        position: 'fixed', top: '20px', right: '20px',
        zIndex: '1000', padding: '15px 25px',
        borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.transition = 'opacity 0.3s ease';
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 300);
    }, 2000);
}
