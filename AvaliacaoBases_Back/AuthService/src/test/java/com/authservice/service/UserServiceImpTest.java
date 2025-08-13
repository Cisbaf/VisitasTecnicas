package com.authservice.service;

import com.authservice.entity.UserEntity;
import com.authservice.entity.userDto.UserRequest;
import com.authservice.entity.userDto.UserResponse;
import com.authservice.respository.UserRepository;
import com.authservice.service.jwt.JtwUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImpTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JtwUtils jtwUtils;

    @InjectMocks
    private UserServiceImp userService;

    private final String TEST_USERNAME = "testUser";
    private final String TEST_PASSWORD = "testPassword";
    private final String TEST_ROLE = "testRole";
    private final String TEST_TOKEN = "testToken";

    @Test
    void existsByUsername_ReturnsTrue() {
        when(userRepository.existsByUser(TEST_USERNAME)).thenReturn(true);
        assertTrue(userService.existsByUsername(TEST_USERNAME));
    }

    @Test
    void register_Success() {
        // Setup
        UserRequest request = new UserRequest(TEST_USERNAME, TEST_PASSWORD, TEST_ROLE);
        UserEntity savedEntity = new UserEntity();
        savedEntity.setUser(TEST_USERNAME);
        savedEntity.setPassword(BCrypt.hashpw(TEST_PASSWORD, BCrypt.gensalt()));
        savedEntity.setRole(TEST_ROLE);

        // Mocking
        when(jtwUtils.generateToken(TEST_USERNAME, TEST_ROLE)).thenReturn(TEST_TOKEN);
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedEntity);

        // Execution
        String token = userService.register(request);

        // Verification
        assertEquals(TEST_TOKEN, token);
        verify(userRepository).save(any(UserEntity.class));
        verify(jtwUtils).generateToken(TEST_USERNAME, TEST_ROLE);
    }

    @Test
    void login_Success() {
        // Setup
        UserRequest request = new UserRequest(TEST_USERNAME, TEST_PASSWORD, TEST_ROLE);
        UserEntity entity = new UserEntity();
        entity.setUser(TEST_USERNAME);
        entity.setPassword(BCrypt.hashpw(TEST_PASSWORD, BCrypt.gensalt()));
        entity.setRole(TEST_ROLE);

        // Mocking
        when(userRepository.findByUser(TEST_USERNAME)).thenReturn(entity);
        when(jtwUtils.generateToken(TEST_USERNAME, TEST_ROLE)).thenReturn(TEST_TOKEN);

        // Execution
        String token = userService.login(request);

        // Verification
        assertEquals(TEST_TOKEN, token);
        verify(jtwUtils).generateToken(TEST_USERNAME, TEST_ROLE);
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        // Setup
        UserRequest request = new UserRequest(TEST_USERNAME, "wrongPassword", TEST_ROLE);
        UserEntity entity = new UserEntity();
        entity.setUser(TEST_USERNAME);
        entity.setPassword(BCrypt.hashpw(TEST_PASSWORD, BCrypt.gensalt()));

        // Mocking
        when(userRepository.findByUser(TEST_USERNAME)).thenReturn(entity);

        // Execution & Verification
        assertThrows(RuntimeException.class, () -> userService.login(request));
    }

    @Test
    void findByUsername_Success() {
        // Setup
        UserEntity entity = new UserEntity();
        entity.setUser(TEST_USERNAME);
        entity.setRole(TEST_ROLE);

        // Mocking
        when(userRepository.findByUser(TEST_USERNAME)).thenReturn(entity);

        // Execution
        UserResponse response = userService.findByUsername(TEST_USERNAME);

        // Verification
        assertNotNull(response);
        assertEquals(TEST_USERNAME, response.user());
        assertEquals(TEST_ROLE, response.role());
    }

    @Test
    void findById_Success() {
        // Setup
        Long id = 1L;
        UserEntity entity = new UserEntity();
        entity.setId(id);
        entity.setUser(TEST_USERNAME);

        // Mocking
        when(userRepository.findById(id)).thenReturn(Optional.of(entity));

        // Execution
        UserResponse response = userService.findById(id);

        // Verification
        assertNotNull(response);
        assertEquals(id, response.id());
        assertEquals(TEST_USERNAME, response.user());
    }

    @Test
    void findAll_Success() {
        // Setup
        UserEntity entity = new UserEntity();
        entity.setUser(TEST_USERNAME);

        // Mocking
        when(userRepository.findAll()).thenReturn(List.of(entity));

        // Execution
        List<UserResponse> responses = userService.findAll();

        // Verification
        assertEquals(1, responses.size());
        assertEquals(TEST_USERNAME, responses.getFirst().user());
    }

    @Test
    void deleteById_Success() {
        // Setup
        Long id = 1L;

        // Execution
        userService.deleteById(id);

        // Verification
        verify(userRepository).deleteById(id);
    }

    @Test
    void updateUser_Success() {
        // Setup
        Long id = 1L;
        String newUsername = "newUser";
        UserRequest request = new UserRequest(newUsername, "newPassword", "newRole");

        UserEntity existingEntity = new UserEntity();
        existingEntity.setId(id);
        existingEntity.setUser("oldUser");
        existingEntity.setPassword("oldPassword");
        existingEntity.setRole("oldRole");

        // Mocking
        when(userRepository.findById(id)).thenReturn(Optional.of(existingEntity));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Execution
        UserResponse response = userService.updateUser(id, request);

        // Verification
        assertNotNull(response);
        assertEquals(newUsername, response.user());
        assertEquals("newPassword", response.password());
        assertEquals("newRole", response.role());

        // Verify BeanUtils.copyProperties was effectively used
        assertEquals(newUsername, existingEntity.getUser());
        assertEquals("newPassword", existingEntity.getPassword());
        assertEquals("newRole", existingEntity.getRole());
    }

    @Test
    void updateUser_NotFound_ThrowsException() {
        // Setup
        Long id = 1L;
        UserRequest request = new UserRequest(TEST_USERNAME, TEST_PASSWORD, TEST_ROLE);

        // Mocking
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        // Execution & Verification
        assertThrows(RuntimeException.class, () -> userService.updateUser(id, request));
    }
}