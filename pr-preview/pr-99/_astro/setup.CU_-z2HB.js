const e=[`CREATE TABLE IF NOT EXISTS "user" (
		id TEXT PRIMARY KEY,
		email VARCHAR(255) NOT NULL UNIQUE,
		email_verified BOOLEAN NOT NULL DEFAULT false,
		name TEXT,
		image TEXT,
		bio TEXT,
		role VARCHAR(50) NOT NULL DEFAULT 'reader',
		is_active BOOLEAN NOT NULL DEFAULT true,
		banned BOOLEAN DEFAULT false,
		ban_reason TEXT,
		ban_expires TIMESTAMP,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
		last_login_at TIMESTAMP
	)`,`CREATE TABLE IF NOT EXISTS "session" (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		expires_at TIMESTAMP NOT NULL,
		token TEXT NOT NULL UNIQUE,
		ip_address TEXT,
		user_agent TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "account" (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		account_id TEXT NOT NULL,
		provider_id TEXT NOT NULL,
		access_token TEXT,
		refresh_token TEXT,
		access_token_expires_at TIMESTAMP,
		refresh_token_expires_at TIMESTAMP,
		scope TEXT,
		id_token TEXT,
		password TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "verification" (
		id TEXT PRIMARY KEY,
		identifier TEXT NOT NULL,
		value TEXT NOT NULL,
		expires_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "resources" (
		id TEXT PRIMARY KEY,
		slug VARCHAR(512) NOT NULL UNIQUE,
		external_id TEXT,
		source_uri TEXT,
		title TEXT NOT NULL,
		description TEXT NOT NULL,
		language VARCHAR(10) NOT NULL,
		license VARCHAR(50) NOT NULL,
		resource_type VARCHAR(100) NOT NULL,
		keywords TEXT,
		author TEXT,
		publisher TEXT,
		duration INTEGER,
		accessibility_features TEXT,
		accessibility_hazards TEXT,
		access_mode TEXT,
		created_by TEXT REFERENCES "user"(id),
		editorial_status VARCHAR(50) NOT NULL DEFAULT 'draft',
		assigned_curator_id TEXT REFERENCES "user"(id),
		curated_at TIMESTAMP,
		featured_at TIMESTAMP,
		imported_at TIMESTAMP,
		import_source TEXT,
		deleted_at TIMESTAMP,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "media_items" (
		id TEXT PRIMARY KEY,
		resource_id TEXT NOT NULL REFERENCES "resources"(id) ON DELETE CASCADE,
		type VARCHAR(50) NOT NULL,
		mime_type VARCHAR(255),
		url TEXT NOT NULL,
		file_size INTEGER,
		filename TEXT,
		is_primary BOOLEAN NOT NULL DEFAULT false
	)`,`CREATE TABLE IF NOT EXISTS "upload_sessions" (
		id TEXT PRIMARY KEY,
		resource_id TEXT NOT NULL REFERENCES "resources"(id) ON DELETE CASCADE,
		owner_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		media_item_id TEXT REFERENCES "media_items"(id) ON DELETE SET NULL,
		status VARCHAR(50) NOT NULL DEFAULT 'created',
		original_filename TEXT NOT NULL,
		mime_type VARCHAR(255),
		storage_key TEXT NOT NULL,
		public_url TEXT,
		checksum_algorithm VARCHAR(32),
		final_checksum TEXT,
		error_code VARCHAR(100),
		error_message TEXT,
		declared_size BIGINT,
		received_bytes BIGINT NOT NULL DEFAULT 0,
		expires_at TIMESTAMP,
		completed_at TIMESTAMP,
		cancelled_at TIMESTAMP,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "elpx_projects" (
		id TEXT PRIMARY KEY,
		resource_id TEXT NOT NULL REFERENCES "resources"(id) ON DELETE CASCADE UNIQUE,
		hash VARCHAR(64) NOT NULL UNIQUE,
		extract_path TEXT NOT NULL,
		original_filename TEXT NOT NULL,
		upload_session_id TEXT,
		version INTEGER NOT NULL DEFAULT 3,
		has_preview BOOLEAN NOT NULL DEFAULT false,
		elpx_metadata TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "resource_subjects" (
		resource_id TEXT NOT NULL REFERENCES "resources"(id) ON DELETE CASCADE,
		subject VARCHAR(255) NOT NULL
	)`,`CREATE TABLE IF NOT EXISTS "resource_levels" (
		resource_id TEXT NOT NULL REFERENCES "resources"(id) ON DELETE CASCADE,
		level VARCHAR(100) NOT NULL
	)`,`CREATE TABLE IF NOT EXISTS "collections" (
		id TEXT PRIMARY KEY,
		slug VARCHAR(512) NOT NULL UNIQUE,
		title TEXT NOT NULL,
		description TEXT NOT NULL,
		cover_image_url TEXT,
		is_ordered BOOLEAN NOT NULL DEFAULT false,
		editorial_status VARCHAR(50) NOT NULL DEFAULT 'draft',
		curator_id TEXT NOT NULL REFERENCES "user"(id),
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "collection_resources" (
		collection_id TEXT NOT NULL REFERENCES "collections"(id) ON DELETE CASCADE,
		resource_id TEXT NOT NULL REFERENCES "resources"(id) ON DELETE CASCADE,
		position INTEGER NOT NULL DEFAULT 0
	)`,`CREATE TABLE IF NOT EXISTS "taxonomies" (
		id TEXT PRIMARY KEY,
		slug VARCHAR(255) NOT NULL UNIQUE,
		name TEXT NOT NULL,
		type VARCHAR(100) NOT NULL DEFAULT 'category',
		parent_id TEXT REFERENCES taxonomies(id) ON DELETE SET NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "ratings" (
		id TEXT PRIMARY KEY,
		resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
		user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		score INTEGER NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
		UNIQUE(resource_id, user_id)
	)`,`CREATE TABLE IF NOT EXISTS "favorites" (
		id TEXT PRIMARY KEY,
		resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
		user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		UNIQUE(resource_id, user_id)
	)`,`CREATE TABLE IF NOT EXISTS "downloads" (
		id TEXT PRIMARY KEY,
		resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
		user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,`CREATE TABLE IF NOT EXISTS "activity_events" (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		type VARCHAR(50) NOT NULL,
		resource_id TEXT REFERENCES resources(id) ON DELETE SET NULL,
		resource_title TEXT,
		resource_slug VARCHAR(512),
		description TEXT NOT NULL,
		metadata TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`,"CREATE INDEX IF NOT EXISTS idx_ratings_resource_id ON ratings(resource_id)","CREATE INDEX IF NOT EXISTS idx_favorites_resource_id ON favorites(resource_id)","CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)","CREATE INDEX IF NOT EXISTS idx_downloads_resource_id ON downloads(resource_id)","CREATE INDEX IF NOT EXISTS idx_activity_events_user_created ON activity_events(user_id, created_at DESC)","CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug)","CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(editorial_status)","CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type)","CREATE INDEX IF NOT EXISTS idx_upload_sessions_resource_id ON upload_sessions(resource_id)","CREATE INDEX IF NOT EXISTS idx_upload_sessions_owner_id ON upload_sessions(owner_id)","CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status)","CREATE INDEX IF NOT EXISTS idx_elpx_projects_hash ON elpx_projects(hash)","CREATE INDEX IF NOT EXISTS idx_elpx_projects_resource_id ON elpx_projects(resource_id)","CREATE INDEX IF NOT EXISTS idx_taxonomies_type ON taxonomies(type)",`DO $$ BEGIN
		ALTER TABLE "resources" ADD COLUMN created_by TEXT REFERENCES "user"(id);
	EXCEPTION WHEN duplicate_column THEN NULL;
	END $$`,`DO $$ BEGIN
		ALTER TABLE "user" ADD COLUMN bio TEXT;
	EXCEPTION WHEN duplicate_column THEN NULL;
	END $$`,`CREATE TABLE IF NOT EXISTS "platform_settings" (
		key VARCHAR(100) PRIMARY KEY,
		value TEXT NOT NULL,
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`],N=`
INSERT INTO taxonomies (id, slug, name, type, created_at, updated_at) VALUES
  ('rt-documento', 'documento', 'Documento', 'resource-type', NOW(), NOW()),
  ('rt-presentacion', 'presentacion', 'Presentacion', 'resource-type', NOW(), NOW()),
  ('rt-video', 'video', 'Video', 'resource-type', NOW(), NOW()),
  ('rt-audio', 'audio', 'Audio', 'resource-type', NOW(), NOW()),
  ('rt-imagen', 'imagen', 'Imagen', 'resource-type', NOW(), NOW()),
  ('rt-actividad-interactiva', 'actividad-interactiva', 'Actividad interactiva', 'resource-type', NOW(), NOW()),
  ('rt-secuencia-didactica', 'secuencia-didactica', 'Secuencia didactica', 'resource-type', NOW(), NOW()),
  ('rt-ejercicio', 'ejercicio', 'Ejercicio', 'resource-type', NOW(), NOW()),
  ('rt-evaluacion', 'evaluacion', 'Evaluacion', 'resource-type', NOW(), NOW()),
  ('rt-proyecto', 'proyecto', 'Proyecto', 'resource-type', NOW(), NOW()),
  ('lang-es', 'es', 'Espanol', 'language', NOW(), NOW()),
  ('lang-en', 'en', 'Ingles', 'language', NOW(), NOW()),
  ('lang-ca', 'ca', 'Catalan', 'language', NOW(), NOW()),
  ('lang-eu', 'eu', 'Euskera', 'language', NOW(), NOW()),
  ('lang-gl', 'gl', 'Gallego', 'language', NOW(), NOW()),
  ('lang-fr', 'fr', 'Frances', 'language', NOW(), NOW()),
  ('lang-pt', 'pt', 'Portugues', 'language', NOW(), NOW()),
  ('lang-de', 'de', 'Aleman', 'language', NOW(), NOW()),
  ('lang-it', 'it', 'Italiano', 'language', NOW(), NOW()),
  ('lic-cc-by', 'cc-by', 'CC BY', 'license', NOW(), NOW()),
  ('lic-cc-by-sa', 'cc-by-sa', 'CC BY-SA', 'license', NOW(), NOW()),
  ('lic-cc-by-nc', 'cc-by-nc', 'CC BY-NC', 'license', NOW(), NOW()),
  ('lic-cc-by-nc-sa', 'cc-by-nc-sa', 'CC BY-NC-SA', 'license', NOW(), NOW()),
  ('lic-cc-by-nc-nd', 'cc-by-nc-nd', 'CC BY-NC-ND', 'license', NOW(), NOW()),
  ('lic-cc-by-nd', 'cc-by-nd', 'CC BY-ND', 'license', NOW(), NOW()),
  ('lic-cc0', 'cc0', 'CC0 (Dominio publico)', 'license', NOW(), NOW())
ON CONFLICT (id) DO NOTHING
`,a=`
INSERT INTO platform_settings (key, value, updated_at) VALUES
  ('badge_novedad_days', '30', NOW()),
  ('badge_destacado_min_ratings', '3', NOW()),
  ('badge_destacado_min_avg', '4.0', NOW()),
  ('badge_destacado_min_favorites', '3', NOW())
ON CONFLICT (key) DO NOTHING
`;async function s(E){for(const T of e)await E.exec(T);await E.exec(N),await E.exec(a)}export{e as SCHEMA_STATEMENTS,s as createTables};
