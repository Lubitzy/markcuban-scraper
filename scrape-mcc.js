// scrape-mcc.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { URL } = require('url');

const BASE = 'https://markcubancompanies.com';

async function fetchHtml(url) {
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; scraper/1.0)'
        },
        timeout: 20000
    });
    return res.data;
}

function absoluteUrl(base, path) {
    try {
        return new URL(path, base).href;
    } catch (e) {
        return path;
    }
}

function hostnameOf(h) {
    try { return new URL(h).hostname.replace(/^www\./, ''); }
    catch (e) { return ''; }
}

(async () => {
    try {
        console.log('Fetching main page...');
        const mainHtml = await fetchHtml(BASE + '/');
        const $main = cheerio.load(mainHtml);

        // Heuristic: collect all links that contain '/companies/' in href
        const linksSet = new Set();
        $main('a[href]').each((i, el) => {
            const href = $main(el).attr('href');
            if (!href) return;
            if (href.includes('/companies/')) {
                const full = absoluteUrl(BASE, href.split('#')[0].split('?')[0] + '/'); // normalize
                linksSet.add(full);
            }
        });

        const companyUrls = Array.from(linksSet).sort();
        console.log(`Found ${companyUrls.length} company links (examples):`, companyUrls.slice(0, 6));

        const rows = [];
        for (const url of companyUrls) {
            try {
                console.log('Processing', url);
                // Some links open as modal endpoints (with ?modal=). Fetch the modal URL too if needed.
                const modalUrl = url.includes('?') ? url : url + '?modal=';
                const html = await fetchHtml(modalUrl);
                const $ = cheerio.load(html);

                // Brand name: usually in an H1
                let brand = $('h1').first().text().trim();
                if (!brand) {
                    // fallback: title tag
                    brand = ($('title').text() || '').trim();
                }

                // Collect anchors and classify them
                const anchors = [];
                $('a[href]').each((i, el) => {
                    const href = $(el).attr('href').trim();
                    if (!href) return;
                    const abs = absoluteUrl(BASE, href);
                    anchors.push({ href: abs, text: $(el).text().trim() });
                });

                // Find social links
                let facebook = '';
                let instagram = '';
                let website = '';

                // Prefer links that contain the social hostnames
                for (const a of anchors) {
                    const host = hostnameOf(a.href).toLowerCase();
                    if (!facebook && host.includes('facebook.com')) facebook = a.href;
                    if (!instagram && (host.includes('instagram.com') || host.includes('instagr.am'))) instagram = a.href;
                }

                // For brand website: choose the first anchor that is external (not markcubancompanies.com) and not a social link
                for (const a of anchors) {
                    const host = hostnameOf(a.href).toLowerCase();
                    if (!host) continue;
                    if (host.includes('markcubancompanies.com')) continue;
                    if (host.includes('facebook.com') || host.includes('instagram.com') || host.includes('twitter.com') || host.includes('linkedin.com') || host.includes('youtube.com')) continue;
                    // often there is one anchor labeled 'Website'
                    website = a.href;
                    break;
                }

                // final fallback: try to find a link right after text 'Website' on the page
                if (!website) {
                    const websiteLabel = $('*:contains("Website")').filter(function () {
                        return $(this).text().trim().toLowerCase() === 'website' || $(this).text().trim().toLowerCase().startsWith('website');
                    }).first();
                    if (websiteLabel && websiteLabel.length) {
                        const found = websiteLabel.nextAll('a[href]').first().attr('href');
                        if (found) website = absoluteUrl(BASE, found);
                    }
                }

                rows.push({
                    brand,
                    website: website || '',
                    facebook: facebook || '',
                    instagram: instagram || ''
                });

                // polite short pause (avoid hammering)
                await new Promise(r => setTimeout(r, 250));
            } catch (err) {
                console.error('Failed to process', url, err.message);
            }
        }

        // Write CSV
        const header = ['Brand name', 'brand website', 'facebook link', 'instagram link'];
        const lines = [header.join(',')];
        for (const r of rows) {
            // escape quotes and commas
            const esc = v => `"${(v || '').replace(/"/g, '""')}"`;
            lines.push([esc(r.brand), esc(r.website), esc(r.facebook), esc(r.instagram)].join(','));
        }
        const out = lines.join('\n');
        fs.writeFileSync('markcubancompanies.csv', out, 'utf8');
        console.log('Done. Written markcubancompanies.csv with', rows.length, 'rows.');
    } catch (err) {
        console.error('Fatal error', err);
    }
})();
