package vn.hoidanit.springrestwithai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import vn.hoidanit.springrestwithai.exception.DuplicateResourceException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User buildUser(String email, String rawPassword) {
        User user = new User();
        user.setName("Test User");
        user.setEmail(email);
        user.setPassword(rawPassword);
        return user;
    }

    private User buildExistingUser() {
        User user = new User();
        user.setId(1L);
        user.setName("Old Name");
        user.setEmail("old@example.com");
        user.setPassword("old-encoded");
        user.setAge(20);
        user.setAddress("Old Address");
        user.setGender(User.GenderEnum.MALE);
        user.setAvatar("old.png");
        return user;
    }

    @Nested
    @DisplayName("getAllUsers")
    class GetAllUsersTests {

        @Test
        @DisplayName("Returns list from repository")
        void returnsAllUsers() {
            User user1 = buildUser("a@example.com", "raw");
            User user2 = buildUser("b@example.com", "raw");

            when(userRepository.findAll()).thenReturn(List.of(user1, user2));

            List<User> result = userService.getAllUsers();

            assertEquals(2, result.size());
            assertSame(user1, result.get(0));
            assertSame(user2, result.get(1));
            verify(userRepository).findAll();
        }
    }

    @Nested
    @DisplayName("getUserById")
    class GetUserByIdTests {

        @Test
        @DisplayName("Returns user when id exists")
        void returnsUserWhenFound() {
            User existing = buildExistingUser();
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

            User result = userService.getUserById(1L);

            assertSame(existing, result);
        }

        @Test
        @DisplayName("Throws ResourceNotFoundException when id missing")
        void throwsWhenNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(999L));
        }
    }

    @Nested
    @DisplayName("createUser")
    class CreateUserTests {

        @Nested
        @DisplayName("Failure cases")
        class CreateUserFailureTests {

            @Test
            @DisplayName("Duplicate email throws DuplicateResourceException")
            void duplicateEmailThrowsException() {
                User input = buildUser("dup@example.com", "raw-password");
                when(userRepository.existsByEmail(input.getEmail())).thenReturn(true);

                DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                        () -> userService.createUser(input));

                assertTrue(ex.getMessage().contains(input.getEmail()));
            }

            @Test
            @DisplayName("Duplicate email does not save or encode")
            void duplicateEmailDoesNotSave() {
                User input = buildUser("dup@example.com", "raw-password");
                when(userRepository.existsByEmail(input.getEmail())).thenReturn(true);

                assertThrows(DuplicateResourceException.class, () -> userService.createUser(input));

                verify(userRepository, never()).save(any(User.class));
                verify(passwordEncoder, never()).encode(any());
            }
        }

        @Nested
        @DisplayName("Success cases")
        class CreateUserSuccessTests {

            @Test
            @DisplayName("existsByEmail is called before save")
            void existsByEmailBeforeSave() {
                User input = buildUser("order@example.com", "raw-123");
                String rawPassword = input.getPassword();
                String encodedPassword = "encoded-123";

                when(userRepository.existsByEmail(input.getEmail())).thenReturn(false);
                when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
                when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

                userService.createUser(input);

                InOrder inOrder = inOrder(userRepository);
                inOrder.verify(userRepository).existsByEmail(input.getEmail());
                inOrder.verify(userRepository).save(any(User.class));
            }

            @Test
            @DisplayName("Password is encoded before save")
            void encodeBeforeSave() {
                User input = buildUser("test@example.com", "raw-password");
                String rawPassword = input.getPassword();
                String encodedPassword = "encoded-password";

                when(userRepository.existsByEmail(input.getEmail())).thenReturn(false);
                when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
                when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

                userService.createUser(input);

                InOrder inOrder = inOrder(passwordEncoder, userRepository);
                inOrder.verify(passwordEncoder).encode(rawPassword);
                inOrder.verify(userRepository).save(argThat(saved -> encodedPassword.equals(saved.getPassword())
                        && !rawPassword.equals(saved.getPassword())));
            }

            @Test
            @DisplayName("Returns saved user")
            void happyPathCreateUser() {
                User input = buildUser("happy@example.com", "raw-password");
                String rawPassword = input.getPassword();
                String encodedPassword = "encoded-password";

                User saved = buildUser(input.getEmail(), encodedPassword);
                saved.setId(10L);

                when(userRepository.existsByEmail(input.getEmail())).thenReturn(false);
                when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
                when(userRepository.save(any(User.class))).thenReturn(saved);

                User result = userService.createUser(input);

                assertEquals(saved.getId(), result.getId());
                assertEquals(encodedPassword, result.getPassword());
            }
        }
    }

    @Nested
    @DisplayName("updateUser")
    class UpdateUserTests {

        @Test
        @DisplayName("Updates provided fields and encodes password")
        void updatesProvidedFields() {
            User existing = buildExistingUser();
            User update = new User();
            update.setEmail("new@example.com");
            update.setName("New Name");
            update.setAge(30);
            update.setAddress("New Address");
            update.setGender(User.GenderEnum.FEMALE);
            update.setAvatar("new.png");
            update.setPassword("new-raw");

            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(passwordEncoder.encode("new-raw")).thenReturn("new-encoded");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User result = userService.updateUser(1L, update);

            assertEquals("new@example.com", result.getEmail());
            assertEquals("New Name", result.getName());
            assertEquals(30, result.getAge());
            assertEquals("New Address", result.getAddress());
            assertEquals(User.GenderEnum.FEMALE, result.getGender());
            assertEquals("new.png", result.getAvatar());
            assertEquals("new-encoded", result.getPassword());
            verify(passwordEncoder).encode("new-raw");
        }

        @Test
        @DisplayName("Ignores null fields and blank password")
        void ignoresNullAndBlankPassword() {
            User existing = buildExistingUser();
            User update = new User();
            update.setPassword("   ");

            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User result = userService.updateUser(1L, update);

            assertEquals("old@example.com", result.getEmail());
            assertEquals("Old Name", result.getName());
            assertEquals(20, result.getAge());
            assertEquals("Old Address", result.getAddress());
            assertEquals(User.GenderEnum.MALE, result.getGender());
            assertEquals("old.png", result.getAvatar());
            assertEquals("old-encoded", result.getPassword());
            verify(passwordEncoder, never()).encode(any());
        }

        @Test
        @DisplayName("Throws when id not found")
        void updateThrowsWhenMissing() {
            when(userRepository.findById(404L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> userService.updateUser(404L, new User()));
        }
    }

    @Nested
    @DisplayName("deleteUser")
    class DeleteUserTests {

        @Test
        @DisplayName("Deletes when id exists")
        void deletesWhenFound() {
            User existing = buildExistingUser();
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

            userService.deleteUser(1L);

            verify(userRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Throws when id missing and does not delete")
        void deleteThrowsWhenMissing() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(999L));
            verify(userRepository, never()).deleteById(any());
        }
    }
}
