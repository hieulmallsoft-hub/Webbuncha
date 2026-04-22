package vn.hoidanit.springrestwithai.features.payments.vnpay.infrastructure.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(VnpayProperties.class)
public class VnpayConfig {
}
