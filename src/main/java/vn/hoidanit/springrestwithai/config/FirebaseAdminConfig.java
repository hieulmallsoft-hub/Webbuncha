package vn.hoidanit.springrestwithai.config;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;

@Configuration
@EnableConfigurationProperties(FirebasePushProperties.class)
public class FirebaseAdminConfig {

    @Bean
    @ConditionalOnProperty(name = "app.push.firebase.enabled", havingValue = "true")
    FirebaseApp firebaseApp(FirebasePushProperties properties, ResourceLoader resourceLoader) throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getApps().get(0);
        }

        FirebaseOptions.Builder builder = FirebaseOptions.builder();
        if (hasText(properties.getServiceAccountLocation())) {
            Resource resource = resourceLoader.getResource(properties.getServiceAccountLocation());
            try (InputStream inputStream = resource.getInputStream()) {
                builder.setCredentials(GoogleCredentials.fromStream(inputStream));
            }
        } else {
            builder.setCredentials(GoogleCredentials.getApplicationDefault());
        }

        if (hasText(properties.getProjectId())) {
            builder.setProjectId(properties.getProjectId());
        }

        return FirebaseApp.initializeApp(builder.build());
    }

    @Bean
    @ConditionalOnBean(FirebaseApp.class)
    FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
