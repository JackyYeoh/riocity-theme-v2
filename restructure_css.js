const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

if (!css.includes('/* === REBATE APP-LIKE OVERHAUL (API V3) === */')) {
    const newCss = `

/* === REBATE APP-LIKE OVERHAUL (API V3) === */

/* 1. Hero Dashboard */
.rebate-hero-dashboard {
    position: relative;
    background: linear-gradient(135deg, #090e17 0%, #1e293b 100%);
    border-radius: 24px;
    padding: 48px;
    margin-bottom: 40px;
    overflow: hidden;
    color: #fff;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.hero-decorative {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 1;
}
.hero-decor {
    position: absolute;
    filter: drop-shadow(0 20px 30px rgba(0,0,0,0.4));
    animation: float 6s ease-in-out infinite;
}
.decor-top-right {
    top: -20px;
    right: 5%;
    width: 200px;
    opacity: 0.9;
    animation-delay: -3s;
}
.decor-bottom-left {
    bottom: -10px;
    right: 25%;
    width: 150px;
    opacity: 0.7;
    transform: rotate(-15deg);
}
@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-15px) rotate(5deg); }
}

.rebate-hero-main {
    position: relative;
    z-index: 2;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: 40px;
}
.hero-titles {
    flex: 1;
}
.hero-title {
    font-size: 3.5rem;
    font-family: var(--font-heading, "Outfit", sans-serif);
    font-weight: 800;
    margin-bottom: 15px;
    line-height: 1.1;
}
.text-gradient {
    background: linear-gradient(to right, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hero-subtitle {
    font-size: 1.1rem;
    color: #cbd5e1;
    max-width: 400px;
}

/* Glassmorphic Claim Card */
.hero-claim-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    min-width: 400px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.claim-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
}
.stat-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.stat-label {
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
    color: #94a3b8;
    font-weight: 600;
}
.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: var(--font-heading, "Outfit", sans-serif);
}
.text-blue {
    color: #38bdf8;
    text-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
}
.stat-divider {
    width: 1px;
    background: rgba(255,255,255,0.1);
    margin: 0 20px;
}
.hero-btn {
    width: 100%;
    padding: 16px;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 12px;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    border: none;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
}
.hero-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(37, 99, 235, 0.6);
}

/* 2. Tabs Navigation */
.rebate-tabs-container {
    display: flex;
    gap: 10px;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 30px;
}
.rebate-tab {
    background: transparent;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    font-family: var(--font-heading, "Outfit", sans-serif);
    position: relative;
    transition: color 0.3s ease;
}
.rebate-tab:hover {
    color: #0f172a;
}
.rebate-tab.active {
    color: #2563eb;
}
.rebate-tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #2563eb;
    border-radius: 3px 3px 0 0;
}

/* 3. Tab Content Panes */
.tab-pane {
    display: none;
    animation: fadeIn 0.4s ease;
}
.tab-pane.active {
    display: block;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* 4. Details / Provider Logos Grid */
.provider-category-title {
    font-family: var(--font-heading, "Outfit", sans-serif);
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}
.provider-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}
.provider-rate-card {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    transition: all 0.3s ease;
    min-height: 120px;
}
.provider-rate-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    border-color: #cbd5e1;
}
.provider-logo {
    max-width: 120px;
    max-height: 40px;
    object-fit: contain;
}
.rate-badge {
    background: #f0f9ff;
    color: #0284c7;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    border: 1px solid #bae6fd;
}

/* 5. Empty State styling */
.empty-history-state {
    text-align: center;
    padding: 80px 20px;
    background: #f8fafc;
    border-radius: 20px;
    border: 1px dashed #cbd5e1;
}
.empty-icon-circle {
    width: 80px;
    height: 80px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 30px;
    color: #cbd5e1;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.empty-history-state h3 {
    font-family: var(--font-heading);
    color: #475569;
    margin-bottom: 10px;
}
.empty-history-state p {
    color: #94a3b8;
}

@media (max-width: 1024px) {
    .rebate-hero-main {
        flex-direction: column;
        text-align: center;
    }
    .hero-claim-card {
        min-width: 100%;
    }
    .hero-title { font-size: 2.5rem; }
    .hero-subtitle { margin: 0 auto; }
}
`;
    fs.writeFileSync('css/style.css', css + newCss);
    console.log('Appended Rebate API V3 Overhaul CSS successfully!');
} else {
    console.log('CSS Overhaul already applied.');
}
