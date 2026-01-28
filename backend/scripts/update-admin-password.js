import dotenv from 'dotenv';
import db from '../config/database.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function updateAdminPassword() {
    try {
        console.log('🔧 Updating admin password...\n');

        const newPassword = '123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin password
        await db.query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@example.com']
        );

        console.log('✅ Admin password updated successfully!');
        console.log('   Email: admin@example.com');
        console.log('   New Password: 123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update password:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

updateAdminPassword();
