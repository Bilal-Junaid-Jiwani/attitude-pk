const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const SettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

const fs = require('fs');

async function checkSettings() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env.local');
        }
        await mongoose.connect(process.env.MONGO_URI);
        const log = [];
        log.push('Connected to MongoDB');

        const taxConfig = await Setting.findOne({ key: 'taxConfig' });
        log.push('Tax Config in DB: ' + JSON.stringify(taxConfig, null, 2));

        const shippingConfig = await Setting.findOne({ key: 'shippingConfig' });
        log.push('Shipping Config in DB: ' + JSON.stringify(shippingConfig, null, 2));

        fs.writeFileSync('scripts/output.txt', log.join('\n'));

    } catch (error) {
        fs.writeFileSync('scripts/output.txt', 'Error: ' + error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkSettings();
