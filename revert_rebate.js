const fs = require('fs');

let rebateHtml = fs.readFileSync('rebate.html', 'utf8');
let indexHtml = fs.readFileSync('index.html', 'utf8');

// The rebate content lives inside <div class="rebate-page" ...> up to </section>
const startIndex = rebateHtml.indexOf('<div class="rebate-page"');
const searchSection = rebateHtml.substring(startIndex);
const endSectionIndex = startIndex + searchSection.indexOf('</section>');

const rebateCore = rebateHtml.substring(startIndex, endSectionIndex);

// Build skeleton from index
const headerSplit = indexHtml.split(/<!-- Hero Section -->/);
const topSkeleton = headerSplit[0].replace(/data-page="index"/, 'data-page="account-details"').replace(/<title>.*?<\/title>/, '<title>Rebate - RioCity Casino</title>');

const footerSplit = indexHtml.split(/<!-- Footer -->/);
const bottomSkeleton = '\n    <!-- Footer -->\n' + footerSplit[1];

// We want to wrap the rebate core inside a <main class="rebate-page"> container
// Wait, rebateCore IS a <div class="rebate-page" ...> ALREADY!
let cleanRebateCore = rebateCore.replace('<div class="rebate-page" style="padding: 0; min-height: auto; background: transparent;">', '<main class="rebate-page">');
cleanRebateCore = cleanRebateCore.substring(0, cleanRebateCore.lastIndexOf('</div>')) + '\n</main>';

// Unhide the rebateUserSection
cleanRebateCore = cleanRebateCore.replace('<div class="logged-in-only" id="rebateUserSection" style="display:none;">', '<div class="logged-in-only" id="rebateUserSection">');

const finalHtml = `${topSkeleton.trim()}
    ${cleanRebateCore}
${bottomSkeleton}`;

fs.writeFileSync('rebate.html', finalHtml);
console.log('Reverted correctly to full-width!');
