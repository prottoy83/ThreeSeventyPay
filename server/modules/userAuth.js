const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { nid, fname, lname, email, phone, dob, pass } = req.body;

    const hashedPass = await bcrypt.hash(pass, 10);

    const query = `
      INSERT INTO user 
      (nid, first_name, last_name, email, phone, dob, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [nid, fname, lname, email, phone, dob, hashedPass], (err) => {
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

        
        return res.status(201).json({
          message: "User registered successfully"
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
