require('dotenv').config();
const axios = require('axios');

async function testSafepay() {
    const env = process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT || 'sandbox';
    const baseUrl = env === 'production'
        ? 'https://api.getsafepay.com'
        : 'https://sandbox.api.getsafepay.com';

    console.log('Testing Safepay Connection...');
    console.log('URL:', `${baseUrl}/order/v1/init`);
    console.log('API Key:', process.env.SAFEPAY_API_KEY);

    try {
        const response = await axios.post(
            `${baseUrl}/order/v1/init`,
            {
                amount: 100.00,
                currency: 'PKR',
                environment: 'sandbox',
                client: process.env.SAFEPAY_API_KEY
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
        const token = response.data.data.token;
        console.log('Token:', token);
        console.log('Tracker:', response.data.data.tracker);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testSafepay();
