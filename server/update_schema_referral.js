const db = require('./config/db');
const { nanoid } = require('nanoid');

const addColumn = "ALTER TABLE user ADD COLUMN referral_code VARCHAR(20) UNIQUE DEFAULT NULL";

const getNullUsers = "SELECT uid FROM user WHERE referral_code IS NULL";
const updateUser = "UPDATE user SET referral_code = ? WHERE uid = ?";

console.log("Starting migration...");

db.query(addColumn, (err) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'referral_code' already exists.");
        } else {
            console.error("Error adding column:", err);
            process.exit(1);
        }
    } else {
        console.log("Column 'referral_code' added successfully.");
    }

    // Now backfill
    db.query(getNullUsers, (err, users) => {
        if (err) {
            console.error("Error fetching users:", err);
            process.exit(1);
        }

        if (users.length === 0) {
            console.log("No users to update.");
            process.exit(0);
        }

        console.log(`Found ${users.length} users to update.`);

        let completed = 0;
        users.forEach(user => {
            const code = nanoid(10);
            db.query(updateUser, [code, user.uid], (err) => {
                if (err) console.error(`Error updating user ${user.uid}:`, err);
                else console.log(`Updated user ${user.uid} with code ${code}`);

                completed++;
                if (completed === users.length) {
                    console.log("Migration complete.");
                    process.exit(0);
                }
            });
        });
    });
});
