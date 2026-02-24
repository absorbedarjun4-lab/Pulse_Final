/**
 * seedAdmin.js
 *
 * Run once to create the initial admin account:
 *   node scripts/seedAdmin.js
 *
 * Default credentials (CHANGE IN PRODUCTION):
 *   Email:    admin@crisis.gov
 *   Password: Admin@1234
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@crisis.gov';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME = 'System Administrator';

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅  Connected to MongoDB Atlas');

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log(`⚠️   Admin already exists: ${ADMIN_EMAIL}`);
            await mongoose.disconnect();
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
        });

        console.log('🔐  Admin account created successfully');
        console.log(`    Email:    ${ADMIN_EMAIL}`);
        console.log(`    Password: ${ADMIN_PASSWORD}`);
        console.log('    ⚠️  Change this password immediately in production!');
    } catch (err) {
        console.error('❌  Seed error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();
