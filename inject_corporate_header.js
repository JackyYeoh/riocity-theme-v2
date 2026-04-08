const fs = require('fs');

let html = fs.readFileSync('rebate.html', 'utf8');

// Replace the Hero section
const heroStart = '<div class="rebate-hero-dashboard">';
const tabsStart = '<!-- 2. App-Like Horizontal Tabs -->';

const startIndex = html.indexOf(heroStart);
const endIndex = html.indexOf(tabsStart);

if (startIndex > -1 && endIndex > -1) {
    const cleanerHeader = `
        <!-- 1. Ultra-Clean Corporate Claim Header -->
        <div class="corporate-rebate-header">
            <div class="header-titles">
                <h1 class="title">Rebate</h1>
                <p class="subtitle">Automatic daily cashback based on your VIP level.</p>
            </div>
            <div class="corporate-claim-card">
                <div class="claim-stats-inline">
                    <div class="stat-col">
                        <span class="stat-label">Claimable Rebate</span>
                        <span class="stat-val text-blue">PKR 0.128</span>
                    </div>
                    <div class="vertical-divider"></div>
                    <div class="stat-col">
                        <span class="stat-label">Total Lifetime Rebate</span>
                        <span class="stat-val">PKR 0.000</span>
                    </div>
                    <div class="vertical-divider"></div>
                    <div class="stat-col">
                        <span class="stat-label">My Individual Sales</span>
                        <span class="stat-val">PKR 163.590</span>
                    </div>
                </div>
                <button class="btn btn-primary corporate-claim-btn" onclick="this.innerHTML='<i class=\\'fa-solid fa-spinner fa-spin\\'></i> Claiming...'">
                    Claim
                </button>
            </div>
        </div>

        `;

    const before = html.substring(0, startIndex);
    const after = html.substring(endIndex);
    html = before + cleanerHeader + after;
    
    fs.writeFileSync('rebate.html', html);
    console.log("Corporate Header injected into rebate.html");
} else {
    console.log("Could not find hero block");
}
