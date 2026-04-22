package vn.hoidanit.springrestwithai.features.notification.sms;

public interface SmsSender {

    void send(String toPhone, String message);
}

