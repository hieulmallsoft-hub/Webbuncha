package vn.hoidanit.springrestwithai.features.notification.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LogSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(LogSmsSender.class);

    @Override
    public void send(String toPhone, String message) {
        log.info("SMS to {}: {}", toPhone, message);
    }
}

