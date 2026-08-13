package com.veterinaria.backend.user.service.Impl;

import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.role.repository.RoleRepository;
import com.veterinaria.backend.user.dto.CreateUserDTO;
import com.veterinaria.backend.user.dto.ResetPasswordDTO;
import com.veterinaria.backend.user.dto.UpdateUserDTO;
import com.veterinaria.backend.user.dto.UserDTO;
import com.veterinaria.backend.user.event.UserDeactivatedEvent;
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
    public List<UserDTO> getAllUsers(String search){
        if(search == null || search.trim().isEmpty()){
            List<User> users = userRepository.findAllWithoutSuperAdmin();
            return users.stream().map(userMapper::toDTO).toList();
        }
        List<User> users = userRepository.findBySearchWithoutSuperAdmin(search);
        return users.stream().map(userMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsersPaginated(String search, Pageable pageable){
        if(search == null || search.trim().isEmpty()){
            return userRepository.findAllWithoutSuperAdmin(pageable)
                    .map(userMapper::toDTO);
        }
        return userRepository.findBySearchWithoutSuperAdmin(search, pageable)
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
    public void resetPassword(UUID id, ResetPasswordDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);

        userRepository.saveAndFlush(user);
        log.info("Password reset for user: {}", user.getEmail());
    }
}
