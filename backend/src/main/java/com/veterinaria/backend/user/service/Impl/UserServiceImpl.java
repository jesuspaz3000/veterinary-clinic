package com.veterinaria.backend.user.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.role.repository.RoleRepository;
import com.veterinaria.backend.user.dto.ChangePasswordDTO;
import com.veterinaria.backend.user.dto.CreateUserDTO;
import com.veterinaria.backend.user.dto.ResetPasswordDTO;
import com.veterinaria.backend.user.dto.UpdateMyProfileDTO;
import com.veterinaria.backend.user.dto.UpdateUserDTO;
import com.veterinaria.backend.user.dto.UserDTO;
import com.veterinaria.backend.user.event.UserDeactivatedEvent;
import com.veterinaria.backend.user.event.UserReactivatedEvent;
import com.veterinaria.backend.user.event.UserRoleChangedEvent;
import com.veterinaria.backend.user.mapper.UserMapper;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import com.veterinaria.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers(String search, String status){
        List<User> users = userRepository.findAll(buildSpecification(search, status));
        return users.stream().map(userMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsersPaginated(String search, String status, Pageable pageable){
        return userRepository.findAll(buildSpecification(search, status), pageable)
                .map(userMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(UUID id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public UserDTO createUser(CreateUserDTO dto) {
        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new NotFoundException("Role not found"));

        var existingEmail = userRepository.findByEmail(dto.getEmail());

        if (existingEmail.isPresent() && Boolean.TRUE.equals(existingEmail.get().getIsActive())) {
            throw new ConflictException("Email already exists");
        }

        String avatarUrl = null;
        if (dto.getAvatar() != null && !dto.getAvatar().isEmpty()) {
            avatarUrl = storageService.save(dto.getAvatar(), StorageFolder.USERS);
        }

        User user;
        if (existingEmail.isPresent()) {
            user = existingEmail.get();
            user.setUsername(dto.getUsername());
            user.setFirstName(dto.getFirstName());
            user.setLastName(dto.getLastName());
            user.setPhone(dto.getPhone());
            user.setAvatarUrl(avatarUrl);
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole(role);
            user.setIsActive(true);
            user = userRepository.saveAndFlush(user);
        } else {
            user = User.builder()
                    .username(dto.getUsername())
                    .email(dto.getEmail())
                    .password(passwordEncoder.encode(dto.getPassword()))
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .phone(dto.getPhone())
                    .avatarUrl(avatarUrl)
                    .role(role)
                    .build();
            user = userRepository.saveAndFlush(user);
        }

        eventPublisher.publishEvent(new UserRoleChangedEvent(user.getId(), role.getName()));

        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateUser(UUID id, UpdateUserDTO userDto){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Role role = roleRepository.findById(userDto.getRoleId())
                .orElseThrow(() -> new NotFoundException("Role not found"));

        if(!user.getEmail().equals(userDto.getEmail())){
            if(userRepository.findByEmail(userDto.getEmail()).isPresent()){
                throw new ConflictException("Email already exists");
            }
        }

        String avatarUrl = storageService.updateFile(userDto.getAvatar(), user.getAvatarUrl(), userDto.getRemoveAvatar(), StorageFolder.USERS);

        user.setUsername(userDto.getUsername());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setPhone(userDto.getPhone());
        user.setAvatarUrl(avatarUrl);
        user.setRole(role);
        user = userRepository.saveAndFlush(user);

        eventPublisher.publishEvent(new UserRoleChangedEvent(user.getId(), role.getName()));

        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setIsActive(false);
        userRepository.saveAndFlush(user);

        eventPublisher.publishEvent(new UserDeactivatedEvent(user.getId()));

        log.info("User deactivated: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void reactivateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setIsActive(true);
        userRepository.saveAndFlush(user);

        eventPublisher.publishEvent(new UserReactivatedEvent(user.getId()));

        log.info("User reactivated: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(UUID id, ResetPasswordDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);

        userRepository.saveAndFlush(user);
        log.info("Password reset for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public UserDTO updateMyProfile(UUID id, UpdateMyProfileDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.getEmail().equals(dto.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new ConflictException("Email already exists");
            }
        }

        String avatarUrl = storageService.updateFile(dto.getAvatar(), user.getAvatarUrl(), dto.getRemoveAvatar(), StorageFolder.USERS);

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setAvatarUrl(avatarUrl);
        user = userRepository.saveAndFlush(user);

        log.info("Profile updated by user: {}", user.getEmail());
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void changeMyPassword(UUID id, ChangePasswordDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("La contraseña actual no es correcta");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.saveAndFlush(user);

        log.info("Password changed by user: {}", user.getEmail());
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private Specification<User> buildSpecification(String search, String status) {
        Specification<User> spec = (root, query, cb) -> cb.notEqual(root.get("role").get("name"), "SUPERADMIN");

        if (status == null || status.isBlank()) {
            // Por defecto solo se listan usuarios activos
            spec = spec.and((root, query, cb) -> cb.isTrue(root.get("isActive")));
        } else if (!"todos".equalsIgnoreCase(status.trim())) {
            boolean isActive = "activo".equalsIgnoreCase(status.trim());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isActive"), isActive));
        }
        // status == "todos": sin filtro de estado, se listan todos

        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("username")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern)
            ));
        }

        return spec;
    }
}
