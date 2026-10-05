let tableReady = false;

module.exports = async function ensureInteractionsTable(pool) {
  if (tableReady) return;
  try {
    // Check if table exists with wrong user_id type
    const { rows } = await pool.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_interactions'
        AND column_name = 'user_id'
    `);
    if (rows.length > 0 && rows[0].data_type !== 'integer') {
      console.log('user_interactions.user_id is wrong type, recreating table...');
      await pool.query(`DROP TABLE IF EXISTS user_interactions CASCADE`);
    }

    // users.id and events.id are both INTEGER in Neon — no UUID anywhere
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id               SERIAL PRIMARY KEY,
        user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id         INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        interaction_type VARCHAR(20) NOT NULL,
        weight           INTEGER NOT NULL DEFAULT 1,
        metadata         JSONB DEFAULT '{}',
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ui_user_id   ON user_interactions(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ui_event_id  ON user_interactions(event_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ui_created_at ON user_interactions(created_at)`);
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_interactions_user_event_type'
        ) THEN
          ALTER TABLE user_interactions
            ADD CONSTRAINT uq_user_interactions_user_event_type
            UNIQUE (user_id, event_id, interaction_type);
        END IF;
      END $$
    `);
    tableReady = true;
    console.log('user_interactions table ready');
  } catch (err) {
    console.error('ensureInteractionsTable FAILED [' + err.code + ']:', err.message);
    throw err;
  }
};
