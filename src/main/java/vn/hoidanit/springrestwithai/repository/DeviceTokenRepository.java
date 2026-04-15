package vn.hoidanit.springrestwithai.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.hoidanit.springrestwithai.model.DeviceToken;
import vn.hoidanit.springrestwithai.model.User;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    Optional<DeviceToken> findByToken(String token);

    List<DeviceToken> findAllByUser_RoleAndEnabledTrue(User.RoleEnum role);

    long deleteByTokenAndUser_Email(String token, String email);

    void deleteAllByTokenIn(Collection<String> tokens);
}
