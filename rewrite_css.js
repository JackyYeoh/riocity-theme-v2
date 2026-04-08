const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

const rebateCss = `
/* ========================================================================= */
/* REBATE PAGE (CORPORATE FINTECH THEME RESKIN)                              */
/* ========================================================================= */
.rebate-page {
    background: var(--bg-main);
    min-height: 100vh;
    padding-bottom: 80px;
}

.rebate-page .page-top {
    padding-top: 100px;
    padding-bottom: 20px;
}

.rebate-page .page-title-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 8px;
}

.rebate-page .page-title-row i {
    font-size: 1.3rem;
    color: var(--status-warning, #F59E0B);
}

.rebate-page .page-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
}

.rebate-page .page-desc {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0 0 32px 0;
}

/* ── Claim Strip ── */
.rebate-page .claim-strip {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.rebate-page .claim-strip-left {
    display: flex;
    align-items: center;
    gap: 24px;
}

.rebate-page .claim-strip-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.rebate-page .claim-strip-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
}

.rebate-page .claim-strip-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--accent-primary);
    word-break: break-word;
}

.rebate-page .claim-strip-divider {
    width: 1px;
    height: 36px;
    background: var(--border-color);
}

.rebate-page .btn-claim {
    padding: 10px 28px;
    min-height: 44px;
    background: var(--accent-primary);
    color: #ffffff;
    font-weight: 700;
    font-size: 0.85rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.rebate-page .btn-claim:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

/* ── Stats Row ── */
.rebate-page .stats-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 48px;
}

.rebate-page .stat-box {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 22px 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.rebate-page .stat-box-label {
    font-size: 0.78rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 6px;
}

.rebate-page .stat-box-value {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--text-primary);
}

/* ── Section Heading ── */
.rebate-page .section-heading {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 16px 0;
}

/* ── Table ── */
.rebate-page .table-wrap {
    width: 100%;
    overflow-x: auto;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    margin-bottom: 48px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.rebate-page .rb-table {
    width: 100%;
    min-width: 820px;
    border-collapse: collapse;
}

.rebate-page .rb-table th,
.rebate-page .rb-table td {
    padding: 14px;
    text-align: center;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.88rem;
    color: var(--text-muted);
}

.rebate-page .rb-table thead th {
    background: #f8fafc;
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
}

.rebate-page .rb-table tr:hover td {
    background: #f8fafc;
}

/* sticky first col */
.rebate-page .rb-table th:first-child,
.rebate-page .rb-table td:first-child {
    position: sticky;
    left: 0;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    text-align: left;
    padding-left: 20px;
    font-weight: 700;
    color: var(--text-primary);
}

.rebate-page .rb-table thead th:first-child {
    background: #f8fafc;
    z-index: 20;
}

.rebate-page .tier-name {
    font-weight: 800;
    display: block;
}

.rebate-page .top-val {
    color: var(--accent-primary) !important;
    font-weight: 800;
}

.rebate-page .cat-icon {
    margin-right: 8px;
    font-size: 0.85rem;
    color: var(--accent-primary);
}

/* ── Accordion ── */
.rebate-page .guaranteed-section {
    margin-bottom: 60px;
}

.rebate-page .accordion-item {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.rebate-page .accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    cursor: pointer;
    background: var(--bg-secondary);
    transition: background 0.2s;
}

.rebate-page .accordion-header:hover {
    background: #f8fafc;
}

.rebate-page .accordion-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.rebate-page .accordion-header-left i {
    color: var(--accent-primary);
}

.rebate-page .accordion-header-left span {
    font-weight: 800;
    color: var(--text-primary);
}

.rebate-page .accordion-chevron {
    color: var(--text-muted);
    transition: transform 0.2s;
}

.rebate-page .accordion-item.open .accordion-chevron {
    transform: rotate(180deg);
}

.rebate-page .accordion-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.rebate-page .accordion-item.open .accordion-body {
    max-height: 2000px;
}

.rebate-page .accordion-table {
    width: 100%;
    border-collapse: collapse;
}

.rebate-page .accordion-table tr {
    border-top: 1px solid var(--border-color);
}

.rebate-page .accordion-table td {
    padding: 12px 20px;
    font-size: 0.88rem;
    color: var(--text-muted);
}

.rebate-page .accordion-table td:first-child {
    color: var(--text-primary);
    font-weight: 600;
}

.rebate-page .accordion-table td:last-child {
    text-align: right;
    color: var(--accent-primary);
    font-weight: 800;
}

/* Responsive Overrides */
@media (max-width: 768px) {
    .rebate-page .stats-row {
        grid-template-columns: 1fr;
    }
    
    .rebate-page .claim-strip {
        flex-direction: column;
        align-items: stretch;
    }
    
    .rebate-page .claim-strip-left {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    
    .rebate-page .btn-claim { 
        width: 100%; 
        margin-top: 12px;
    }
    
    .rebate-page .claim-strip-divider { 
        display: none; 
    }

    .rebate-page .rb-table {
        min-width: 640px;
    }
}
@media (max-width: 480px) {
    .rebate-page .claim-strip-value {
        font-size: 1rem;
    }
}
`;

fs.writeFileSync('css/style.css', css + "\n" + rebateCss);
console.log('done CSS injection');
