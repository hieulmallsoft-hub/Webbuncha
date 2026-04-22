package vn.hoidanit.springrestwithai.features.payments.vnpay.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payment.vnpay")
public class VnpayProperties {

    private boolean enabled;
    private String tmnCode;
    private String hashSecret;
    private String paymentUrl;
    private String returnUrl;
    private String ipnUrl;
    private String locale = "vn";
    private String version = "2.1.0";
    private String orderType = "other";
    private int expireMinutes = 15;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getTmnCode() {
        return tmnCode;
    }

    public void setTmnCode(String tmnCode) {
        this.tmnCode = normalize(tmnCode);
    }

    public String getHashSecret() {
        return hashSecret;
    }

    public void setHashSecret(String hashSecret) {
        this.hashSecret = normalize(hashSecret);
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = normalize(paymentUrl);
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = normalize(returnUrl);
    }

    public String getIpnUrl() {
        return ipnUrl;
    }

    public void setIpnUrl(String ipnUrl) {
        this.ipnUrl = normalize(ipnUrl);
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = normalize(locale);
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = normalize(version);
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = normalize(orderType);
    }

    public int getExpireMinutes() {
        return expireMinutes;
    }

    public void setExpireMinutes(int expireMinutes) {
        this.expireMinutes = expireMinutes;
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
