package vn.hoidanit.springrestwithai.features.chatbot.application;

import java.time.LocalTime;
import java.time.ZonedDateTime;

import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.features.chatbot.infrastructure.config.StoreHoursProperties;

@Service
public class StoreStatusService {

    private final StoreHoursProperties properties;

    public StoreStatusService(StoreHoursProperties properties) {
        this.properties = properties;
    }

    public boolean isOpenNow() {
        LocalTime now = ZonedDateTime.now(properties.getZoneId()).toLocalTime();
        LocalTime openTime = properties.getOpenTime();
        LocalTime closeTime = properties.getCloseTime();

        if (openTime.equals(closeTime)) {
            return true;
        }
        if (openTime.isBefore(closeTime)) {
            return !now.isBefore(openTime) && now.isBefore(closeTime);
        }
        return !now.isBefore(openTime) || now.isBefore(closeTime);
    }

    public String getHoursText() {
        return properties.getOpenTime() + " - " + properties.getCloseTime();
    }

    public String getAddress() {
        return properties.getAddress();
    }
}
