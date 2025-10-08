// backend/seedUsers.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: 'sql8.freesqldatabase.com',
  user: 'sql8801448',
  password: 'ly9eG7uqyI',
  database: 'sql8801448'
});

db.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
  console.log('Connected to remote MySQL');
});

async function seed() {
  try {
    const users = [
      // Students
      { username: 'student_it', role: 'Student', faculty: 'FICT', department: 'Information Technology' },
      { username: 'student_se', role: 'Student', faculty: 'FICT', department: 'Software Engineering' },
      { username: 'student_bit', role: 'Student', faculty: 'FICT', department: 'Business Information Technology' },

      // Lecturers
      { username: 'lecturer_it', role: 'Lecturer', faculty: 'FICT', department: 'Information Technology' },
      { username: 'lecturer_se', role: 'Lecturer', faculty: 'FICT', department: 'Software Engineering' },
      { username: 'lecturer_bit', role: 'Lecturer', faculty: 'FICT', department: 'Business Information Technology' },

      // PRLs (per program)
      { username: 'prl_it', role: 'PRL', faculty: 'FICT', department: 'Information Technology' },
      { username: 'prl_se', role: 'PRL', faculty: 'FICT', department: 'Software Engineering' },
      { username: 'prl_bit', role: 'PRL', faculty: 'FICT', department: 'Business Information Technology' },

      // Program Leader
      { username: 'pl_fict', role: 'PL', faculty: 'FICT', department: 'Information Technology' }
    ];

    const plainPassword = '1234';

    for (const user of users) {
      const hashed = await bcrypt.hash(plainPassword, 10);

      await new Promise((resolve, reject) => {
        db.query('DELETE FROM users WHERE username = ?', [user.username], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO users (username, password, role, faculty, department) VALUES (?, ?, ?, ?, ?)',
          [user.username, hashed, user.role, user.faculty, user.department],
          (err) => {
            if (err) return reject(err);
            console.log('Inserted:', user.username);
            resolve();
          }
        );
      });
    }

    console.log('✅ Seeding complete! All accounts use password: 1234');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    db.end();
  }
}

seed();
