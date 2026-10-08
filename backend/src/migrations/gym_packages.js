module.exports = {
  table: 'gym_packages',
  async up(db) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS gym_packages (
        id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name        VARCHAR(100) NOT NULL,
        duration    INT NOT NULL COMMENT 'durasi dalam bulan',
        price       DECIMAL(12,2) NOT NULL,
        description TEXT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  },
};
