const bcrypt = require('bcryptjs');

const password = 'kezagasaro2004'; // your test password
const hash = '$2b$10$wYGYtcq5hnGfD3qaB0HhQexj7YbdCi4EEAsHStHmXE5U4rUR2Dxa.'; // paste the hash from Supabase

bcrypt.compare(password, hash, (err, res) => {
  console.log('Match?', res); // should be true
});