const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { pool } = require('./config/database');
const { ApiError } = require('./utils/http');
const membershipModel = require('./models/membership.model');

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/members', require('./routes/member.routes'));
app.use('/api/packages', require('./routes/package.routes'));
app.use('/api/memberships', require('./routes/membership.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/cards', require('./routes/card.routes'));
app.use('/api/stats', require('./routes/stats.routes'));

app.use((req, res, next) => next(new ApiError(404, 'Endpoint tidak ditemukan.')));

// Error handler: semua error dikembalikan sebagai JSON { message, errors? } dengan HTTP status sesuai.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ApiError) return res.status(err.status).json({ message: err.message, ...(err.errors && { errors: err.errors }) });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Body request bukan JSON yang valid.' });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Data sudah ada (duplikat), misalnya email yang sama.' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'Data masih digunakan oleh data lain (mis. membership/pembayaran) sehingga tidak dapat dihapus.' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(422).json({ message: 'Data yang dirujuk tidak ditemukan.' });
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

if (require.main === module) {
  pool.query('SELECT 1')
    .then(() => {
      app.listen(env.port, () => console.log(`CAFU GYM API berjalan di http://localhost:${env.port}/api`));
      const expire = () => membershipModel.expireOutdated().catch((e) => console.error('expire:', e.message));
      expire();
      setInterval(expire, 60 * 60 * 1000).unref();
    })
    .catch((e) => {
      console.error('Tidak dapat terhubung ke database:', e.message, '\nPeriksa file .env dan pastikan MySQL/MariaDB aktif.');
      process.exit(1);
    });
}

module.exports = app;
