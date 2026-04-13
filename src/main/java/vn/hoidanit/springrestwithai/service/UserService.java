package vn.hoidanit.springrestwithai.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.exception.DuplicateResourceException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.repository.UserRepository;

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
        return this.userRepository.findByEmail(email)
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
        if (this.userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException("Nguoi dung", "email", user.getEmail());
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
            String newEmail = user.getEmail();
            if (!newEmail.equals(existing.getEmail()) && this.userRepository.existsByEmail(newEmail)) {
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
}
