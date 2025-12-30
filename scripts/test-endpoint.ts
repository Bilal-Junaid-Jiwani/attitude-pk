
import http from 'http';

const urlProducts = 'http://localhost:3000/api/products';
const urlSettings = 'http://localhost:3000/api/settings?key=shippingConfig';

function checkUrl(url: string) {
    const start = Date.now();
    console.log(`Fetching ${url}...`);
    http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const duration = Date.now() - start;
            console.log(`[${url}] Status: ${res.statusCode} (${duration}ms)`);
            if (res.statusCode !== 200) {
                console.log(`[${url}] Error Body:`, data.substring(0, 500));
            } else {
                try {
                    const json = JSON.parse(data);
                    console.log(`[${url}] Success. Response keys:`, Object.keys(json));
                } catch (e) {
                    console.log(`[${url}] Invalid JSON:`, data.substring(0, 100));
                }
            }
        });
    }).on('error', (err) => {
        console.error(`[${url}] Error:`, err.message);
    });
}

checkUrl(urlProducts);
checkUrl(urlSettings);
