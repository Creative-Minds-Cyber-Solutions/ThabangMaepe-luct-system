// seedUsers.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'luct_report'
});

db.connect(err => {
  if (err) {
    console.error('DB connect error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

async function seed() {
  try {
    const users = [
      // Students
      { username: 'student_it', role: 'Student', faculty: 'FICT' },
      { username: 'student_se', role: 'Student', faculty: 'FICT' },
      { username: 'student_bit', role: 'Student', faculty: 'FICT' },

      // Lecturers
      { username: 'lecturer_it', role: 'Lecturer', faculty: 'FICT' },
      { username: 'lecturer_se', role: 'Lecturer', faculty: 'FICT' },
      { username: 'lecturer_bit', role: 'Lecturer', faculty: 'FICT' },

      // PRL (per program)
      { username: 'prl_it', role: 'PRL', faculty: 'FICT' },
      { username: 'prl_se', role: 'PRL', faculty: 'FICT' },
      { username: 'prl_bit', role: 'PRL', faculty: 'FICT' },

      // Program Leader for FICT
      { username: 'pl_fict', role: 'PL', faculty: 'FICT' }
    ];

    const plainPassword = '1234'; // password for all seeded accounts (you can change)

    for (const u of users) {
      const hashed = await bcrypt.hash(plainPassword, 10);

      // Delete existing username if present (so run is idempotent)
      await new Promise((resolve, reject) => {
        db.query('DELETE FROM users WHERE username = ?', [u.username], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Insert new user
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO users (username, password, role, faculty) VALUES (?, ?, ?, ?)',
          [u.username, hashed, u.role, u.faculty],
          (err) => {
            if (err) return reject(err);
            console.log('Inserted:', u.username);
            resolve();
          }
        );
      });
    }

    console.log('Seeding complete. All accounts use password:', plainPassword);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    db.end();
  }
}

seed();
