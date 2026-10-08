module.exports = {
  table: 'payments',
  async up(db) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        membership_id BIGINT UNSIGNED NOT NULL,
        amount        DECIMAL(12,2) NOT NULL,
        payment_date  DATE NOT NULL,
        status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PAID/PENDING/CANCELLED',
        method        VARCHAR(10) NULL COMMENT 'QRIS/CASH',
        created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_payments_membership (membership_id),
        KEY idx_payments_status (status),
        CONSTRAINT fk_payments_membership FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Database lama (dibuat sebelum ada metode pembayaran): tambahkan kolom jika belum ada.
    const [cols] = await db.query("SHOW COLUMNS FROM payments LIKE 'method'");
    if (!cols.length) await db.query("ALTER TABLE payments ADD COLUMN method VARCHAR(10) NULL COMMENT 'QRIS/CASH' AFTER status");
  },
};
