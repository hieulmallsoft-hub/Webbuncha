package vn.hoidanit.springrestwithai.features.users.application;

import java.util.List;
import java.util.Locale;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.exception.DuplicateResourceException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.features.users.infrastructure.persistence.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return this.userRepository.findAll();
    }

    public User getUserById(Long id) {
        return this.userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguoi dung", "id", id));
    }

    public User getUserByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        return this.userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Nguoi dung", "email", email));
    }

    public void assertOwnerOrAdmin(Long targetUserId, String requesterEmail, boolean isAdmin) {
        if (isAdmin) {
            return;
        }
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Khong co quyen truy cap nguoi dung");
        }
        User requester = getUserByEmail(requesterEmail);
        if (requester.getId() == null || !requester.getId().equals(targetUserId)) {
            throw new AccessDeniedException("Khong co quyen truy cap nguoi dung");
        }
    }

    public User createUser(User user) {
        String normalizedEmail = normalizeEmail(user.getEmail());
        user.setEmail(normalizedEmail);
        if (this.userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("Nguoi dung", "email", normalizedEmail);
        }
        if (user.getRole() == null) {
            user.setRole(User.RoleEnum.USER);
        }
        user.setPassword(this.passwordEncoder.encode(user.getPassword()));
        return this.userRepository.save(user);
    }

    public User updateUser(Long id, User user) {
        User existing = getUserById(id);

        if (user.getEmail() != null) {
            String newEmail = normalizeEmail(user.getEmail());
            if (!newEmail.equalsIgnoreCase(existing.getEmail()) && this.userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new DuplicateResourceException("Nguoi dung", "email", newEmail);
            }
            existing.setEmail(newEmail);
        }
        if (user.getName() != null) {
            existing.setName(user.getName());
        }
        if (user.getAge() != null) {
            existing.setAge(user.getAge());
        }
        if (user.getAddress() != null) {
            existing.setAddress(user.getAddress());
        }
        if (user.getGender() != null) {
            existing.setGender(user.getGender());
        }
        if (user.getAvatar() != null) {
            existing.setAvatar(user.getAvatar());
        }
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            existing.setPassword(this.passwordEncoder.encode(user.getPassword()));
        }

        return this.userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        getUserById(id);
        this.userRepository.deleteById(id);
    }

    public void updatePassword(User user, String rawPassword) {
        if (user == null) {
            throw new IllegalArgumentException("Nguoi dung khong hop le");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Mat khau khong duoc de trong");
        }
        if (user.getPassword() != null && this.passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mat khau moi khong duoc trung mat khau cu");
        }
        user.setPassword(this.passwordEncoder.encode(rawPassword));
        this.userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
