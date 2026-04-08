const fs = require('fs');

// 1. Update HTML
let rebateHtml = fs.readFileSync('rebate.html', 'utf8');

// The user wanted it consistent with "other page" -> other standalone pages have data-page="rebate" (which triggers the dark blue header)
rebateHtml = rebateHtml.replace(/data-page="account-details"/, 'data-page="rebate"');

// Force the logged-in-only claim strip to show for UI mockup demonstration
rebateHtml = rebateHtml.replace(/class="logged-in-only"/g, 'class="logged-in-only show-for-mockup"');

fs.writeFileSync('rebate.html', rebateHtml);

// 2. Add UI/UX Override CSS to style.css
let css = fs.readFileSync('css/style.css', 'utf8');

// Check if we already applied these overrides
if (!css.includes('/* ==========================================================================\n   REBATE PAGE UI/UX FINTECH OVERRIDES')) {
    const cssOverrides = `

/* ==========================================================================
   REBATE PAGE UI/UX FINTECH OVERRIDES (STANDALONE W/ WHITE CARDS)
   ========================================================================== */

/* Show claim strip in mockup */
.rebate-page .show-for-mockup {
    display: block !important;
}

/* 1. Claim Strip & Stats Glassmorphism Polish */
.rebate-page .user-rebate-stats {
    background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04) !important;
    border-radius: 16px !important;
    padding: 24px !important;
    margin-bottom: 32px !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}
.rebate-page .stat-box {
    background: #fff !important;
    border: 1px solid #f1f5f9 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02) !important;
    border-radius: 12px !important;
    padding: 20px !important;
    flex: 1;
}
.rebate-page .claim-button {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-light)) !important;
    color: #fff !important;
    font-weight: 700 !important;
    border-radius: 12px !important;
    padding: 14px 32px !important;
    box-shadow: 0 6px 16px rgba(14, 165, 233, 0.25) !important;
    transition: all 0.3s ease !important;
}
.rebate-page .claim-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(14, 165, 233, 0.35) !important;
}

/* 2. Un-cramped High-Fidelity Table */
.rebate-page .table-wrap {
    min-width: 100% !important;
    overflow-x: auto !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04) !important;
    background: #fff !important;
    border: 1px solid #f1f5f9 !important;
    margin-bottom: 32px !important;
}
.rebate-page .rebate-table {
    min-width: 900px !important; /* Force spread */
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;
}
.rebate-page .rebate-table th {
    background: #f8fafc !important;
    color: var(--text-primary) !important;
    font-family: var(--font-heading, "Outfit", sans-serif) !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    padding: 18px 16px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    border-bottom: 2px solid #e2e8f0 !important;
    border-right: none !important;
}
.rebate-page .rebate-table td {
    padding: 16px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    color: var(--text-secondary) !important;
    font-weight: 500 !important;
    transition: background 0.2s !important;
}
.rebate-page .rebate-table tbody tr:hover td {
    background: #f8fafc !important;
}
.rebate-page .rebate-table .cat-icon {
    color: var(--accent-primary) !important;
    margin-right: 10px !important;
    font-size: 16px !important;
}
.rebate-page .rebate-table .top-val {
    color: var(--accent-primary) !important;
    font-weight: 800 !important;
    background: rgba(14, 165, 233, 0.04) !important;
}

/* 3. Guaranteed Accordion Zebra-Stripe FinTech Cards */
.rebate-page .accordion-item {
    background: #fff !important;
    border: 1px solid #f1f5f9 !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.03) !important;
    margin-bottom: 16px !important;
    overflow: hidden !important;
}
.rebate-page .accordion-header {
    background: #fff !important;
    padding: 20px 24px !important;
    border-radius: 12px !important;
}
.rebate-page .accordion-table {
    padding: 0 !important;
    background: #fafafa !important;
    border-top: 1px solid #fcfcfc !important;
}
.rebate-page .accordion-table > div {
    display: flex !important;
    justify-content: space-between !important;
    padding: 16px 24px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    transition: all 0.2s ease !important;
    font-weight: 500 !important;
    color: var(--text-secondary) !important;
}
/* Alternating zebra stripes */
.rebate-page .accordion-table > div:nth-child(even) {
    background: #ffffff !important;
}
.rebate-page .accordion-table > div:hover {
    background: #f8fafc !important;
    padding-left: 28px !important; /* interactive lift */
    color: var(--accent-primary) !important;
}

@media (max-width: 1024px) {
    .rebate-page .user-rebate-stats {
        flex-direction: column !important;
        padding: 16px !important;
        gap: 16px !important;
    }
    .rebate-page .claim-button {
        width: 100% !important;
    }
}
`;
    fs.writeFileSync('css/style.css', css + cssOverrides);
    console.log('Applied Rebate UI/UX FinTech Overrides!');
} else {
    console.log('UI/UX Overrides already exist.');
}
