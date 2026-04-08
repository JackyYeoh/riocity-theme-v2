const fs = require('fs');

try {
    let indexHtml = fs.readFileSync('index.html', 'utf8');
    let rebateHtml = fs.readFileSync('rebate.html', 'utf8');

    // Extract the skeleton from index.html
    // Everything up to <section class="hero"> (which is right after <div id="site-header"></div>)
    const headerSplit = indexHtml.split(/<!-- Hero Section -->/);
    const topSkeleton = headerSplit[0].replace(/data-page="index"/, 'data-page="rebate"').replace(/<title>.*?<\/title>/, '<title>Rebate - RioCity Casino</title>');

    // From index.html, extract the footer and scripts
    const footerSplit = indexHtml.split(/<!-- Footer -->/);
    const bottomSkeleton = '\n    <!-- Footer -->\n' + footerSplit[1];

    // From rebate.html, extract the actual content
    // Find the LAST <main> tag and get its content
    const mainMatches = [...rebateHtml.matchAll(/<main[^>]*>/gi)];
    let mainContent = '';
    
    if (mainMatches.length > 0) {
        const lastMainTagIndex = mainMatches[mainMatches.length - 1].index;
        const mainTagLength = mainMatches[mainMatches.length - 1][0].length;
        const endMainIndex = rebateHtml.indexOf('</main>', lastMainTagIndex);
        
        if (endMainIndex !== -1) {
             mainContent = rebateHtml.substring(lastMainTagIndex + mainTagLength, endMainIndex);
        } else {
             // fallback parsing
             mainContent = rebateHtml.substring(lastMainTagIndex + mainTagLength);
        }
    } else {
        console.error("COULD NOT FIND MAIN TAG!");
        process.exit(1);
    }

    // Wrap the extracted main content in <main class="rebate-page">
    const finalHtml = `${topSkeleton.trim()}

    <main class="rebate-page">
${mainContent}
    </main>
${bottomSkeleton}`;

    fs.writeFileSync('rebate.html', finalHtml);
    console.log("Successfully rebuilt rebate.html using index.html's clean skeleton.");

} catch(err) {
    console.error(err);
}
