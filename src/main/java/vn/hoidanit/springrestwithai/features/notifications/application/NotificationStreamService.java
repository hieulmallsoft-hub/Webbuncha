package vn.hoidanit.springrestwithai.features.notifications.application;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import vn.hoidanit.springrestwithai.features.notifications.infrastructure.persistence.Notification;
import vn.hoidanit.springrestwithai.features.notifications.presentation.dto.response.NotificationResponse;

@Service
public class NotificationStreamService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));
        return emitter;
    }

    public void emit(Notification notification) {
        NotificationResponse payload = NotificationResponse.from(notification);
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(payload);
            } catch (IOException ex) {
                emitters.remove(emitter);
            }
        }
    }
}
