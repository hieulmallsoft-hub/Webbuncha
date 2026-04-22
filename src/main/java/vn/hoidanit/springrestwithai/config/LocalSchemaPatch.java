package vn.hoidanit.springrestwithai.config;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class LocalSchemaPatch {

    private static final Logger log = LoggerFactory.getLogger(LocalSchemaPatch.class);

    @Bean
    ApplicationRunner ensureUserPhoneColumn(DataSource dataSource) {
        return args -> {
            String productName = "";
            try {
                try (var conn = dataSource.getConnection()) {
                    productName = conn.getMetaData().getDatabaseProductName();
                }
            } catch (Exception ex) {
                log.debug("Cannot read database product name", ex);
                return;
            }

            if (productName == null || !productName.toLowerCase().contains("h2")) {
                return;
            }

            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            try {
                jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
                jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS uk_users_phone ON users(phone)");

                jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE");
                jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP");
            } catch (Exception ex) {
                log.warn("Failed to patch local schema for users table. You may need to delete `./.local-db` and restart.", ex);
            }
        };
    }
}
