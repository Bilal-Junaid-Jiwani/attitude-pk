const http = require('http');

const PORT = 3001; // Trying 3001 first based on previous logs

function fetchProducts(port) {
    console.log(`Checking http://localhost:${port}/api/products ...`);

    http.get(`http://localhost:${port}/api/products`, (res) => {
        let data = '';

        console.log(`Status Code: ${res.statusCode}`);

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                if (res.statusCode === 200) {
                    const products = JSON.parse(data);
                    console.log(`Found ${products.length} products.`);
                    if (products.length > 0) {
                        console.log('Sample Product:', JSON.stringify(products[0], null, 2));
                    }
                } else {
                    console.log('Error Response:', data.substring(0, 200));
                }
            } catch (e) {
                console.error('Failed to parse JSON:', e.message);
                console.log('Raw Data Peek:', data.substring(0, 200));
            }
        });

    }).on('error', (err) => {
        console.error(`Error connecting to port ${port}:`, err.message);
        if (port === 3001) {
            console.log('Retrying on port 3000...');
            fetchProducts(3000);
        }
    });
}

fetchProducts(PORT);
