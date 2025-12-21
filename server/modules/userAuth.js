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
          console.log(err)
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

module.exports = router;
