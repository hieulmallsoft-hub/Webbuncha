package vn.hoidanit.springrestwithai.features.chatbot.infrastructure.config;

import java.time.LocalTime;
import java.time.ZoneId;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.store")
public class StoreHoursProperties {

    private ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
    private LocalTime openTime = LocalTime.of(8, 0);
    private LocalTime closeTime = LocalTime.of(22, 0);
    private String address = "S\u1ed1 8 Tr\u1ea7n Ph\u00fa, Ph\u01b0\u1eddng B\u1ec9m S\u01a1n, T\u1ec9nh Thanh H\u00f3a, Vi\u1ec7t Nam";

    public ZoneId getZoneId() {
        return zoneId;
    }

    public void setZoneId(ZoneId zoneId) {
        this.zoneId = zoneId;
    }

    public LocalTime getOpenTime() {
        return openTime;
    }

    public void setOpenTime(LocalTime openTime) {
        this.openTime = openTime;
    }

    public LocalTime getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(LocalTime closeTime) {
        this.closeTime = closeTime;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
