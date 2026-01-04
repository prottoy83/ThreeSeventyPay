const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { nid, fname, lname, email, phone, dob, pass, referral_code } = req.body;

    const hashedPass = await bcrypt.hash(pass, 10);
    const newReferralCode = nanoid(10);

    const query = `
      INSERT INTO user 
      (nid, first_name, last_name, email, phone, dob, password, referral_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [nid, fname, lname, email, phone, dob, hashedPass, newReferralCode], (err, result) => {
      if (err) {
        console.log(err.message)
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "Email already exists"
          });
        }

        return res.status(500).json({

          error: "Database error"
        });
      }


      const newUserId = result.insertId;

      if (referral_code) {
        const findReferrer = "SELECT uid FROM user WHERE referral_code = ?";
        db.query(findReferrer, [referral_code], (err, referrerResult) => {
          if (!err && referrerResult.length > 0) {
            const referrerId = referrerResult[0].uid;
            const insertReferral = `
              INSERT INTO referral (referrer_id, referred_id, reward_amount)
              VALUES (?, ?, ?)
            `;
            // Default reward amount 50.00
            db.query(insertReferral, [referrerId, newUserId, 50.00], (err) => {
              if (err) console.error("Error creating referral record:", err);
            });
          }
        });
      }

      return res.status(201).json({
        message: "User registered successfully",
        uid: newUserId,
        fname,
        lname,
        email,
        referral_code: newReferralCode
      });
    }
    );

  } catch (err) {
    return res.status(500).json({
      error: `Internal Server Error: ${err.message}`
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, pass } = req.body;
    const query = "SELECT * FROM user WHERE email = ?";

    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (await bcrypt.compare(pass, results[0].Password)) {
        return res.status(200).json({
          uid: results[0].uid,
          fname: results[0].first_name,
          lname: results[0].last_name,
          referral_code: results[0].referral_code,
        });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
});

module.exports = router;
