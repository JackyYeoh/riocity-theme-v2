const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

const newCss = `
/* --- Corporate Clean Header Override --- */
.corporate-rebate-header {
    margin-bottom: 40px;
}
.header-titles .title {
    font-family: var(--font-heading, "Outfit", sans-serif);
    font-size: 2.5rem;
    font-weight: 800;
    color: #1a202c;
    margin-bottom: 8px;
}
.header-titles .subtitle {
    font-size: 1rem;
    color: #64748b;
    margin-bottom: 24px;
}

.corporate-claim-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.claim-stats-inline {
    display: flex;
    align-items: center;
    gap: 40px;
}
.stat-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.stat-col .stat-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 0.5px;
}
.stat-col .stat-val {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    font-family: var(--font-heading, "Outfit", sans-serif);
}
.stat-col .text-blue {
    color: #2563eb;
}
.vertical-divider {
    width: 1px;
    height: 40px;
    background-color: #e2e8f0;
}
.corporate-claim-btn {
    padding: 12px 36px;
    font-size: 1rem;
    font-weight: 600;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
}
.corporate-claim-btn:hover {
    background: #1d4ed8;
}

@media (max-width: 768px) {
    .corporate-claim-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
    .claim-stats-inline {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
        width: 100%;
    }
    .vertical-divider {
        width: 100%;
        height: 1px;
    }
    .corporate-claim-btn {
        width: 100%;
    }
}
`;

fs.writeFileSync('css/style.css', css + newCss);
console.log("Corporate Header CSS injected.");
