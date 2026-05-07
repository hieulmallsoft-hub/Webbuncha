package vn.hoidanit.springrestwithai.features.notifications.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.hoidanit.springrestwithai.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
