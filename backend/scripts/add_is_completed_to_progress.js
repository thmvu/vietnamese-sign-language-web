import db from '../config/database.js';

async function migrate() {
    console.log('🚀 Starting migration: Add is_completed to progress table...');

    try {
        // Check if column exists first
        const [columns] = await db.query("SHOW COLUMNS FROM progress LIKE 'is_completed'");

        if (columns.length === 0) {
            console.log('📦 Adding "is_completed" column...');
            await db.query('ALTER TABLE progress ADD COLUMN is_completed BOOLEAN DEFAULT FALSE AFTER practice_score');

            // Update existing records: if quiz_score > 0, consider it completed for now
            console.log('📦 Backfilling "is_completed" for existing records...');
            await db.query('UPDATE progress SET is_completed = TRUE WHERE quiz_score > 0');

            console.log('✅ Migration successful!');
        } else {
            console.log('ℹ️  Column "is_completed" already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:');
        console.error(error);
        process.exit(1);
    }
}

migrate();
