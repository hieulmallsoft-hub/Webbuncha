package vn.hoidanit.springrestwithai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.hoidanit.springrestwithai.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
