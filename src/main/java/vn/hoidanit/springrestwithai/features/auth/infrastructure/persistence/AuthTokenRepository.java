package vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.AuthToken.TokenType;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {

    Optional<AuthToken> findByTokenHashAndType(String tokenHash, TokenType type);

    long countByEmailAndTypeAndCreatedAtAfter(String email, TokenType type, Instant createdAtAfter);

    void deleteByEmailAndType(String email, TokenType type);
}
