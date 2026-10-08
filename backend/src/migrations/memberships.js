module.exports = {
  table: 'memberships',
  async up(db) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS memberships (
        id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        member_id  BIGINT UNSIGNED NOT NULL,
        package_id BIGINT UNSIGNED NOT NULL,
        start_date DATE NOT NULL,
        end_date   DATE NOT NULL,
        status     VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'ACTIVE/EXPIRED/PENDING',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_memberships_member (member_id),
        KEY idx_memberships_status_end (status, end_date),
        CONSTRAINT fk_memberships_member  FOREIGN KEY (member_id)  REFERENCES members(id)      ON DELETE RESTRICT,
        CONSTRAINT fk_memberships_package FOREIGN KEY (package_id) REFERENCES gym_packages(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  },
};
