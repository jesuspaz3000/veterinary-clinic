package com.veterinaria.backend.grooming.service.Impl;

import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.grooming.dto.CreateGroomingStaffDTO;
import com.veterinaria.backend.grooming.dto.GroomingStaffDTO;
import com.veterinaria.backend.grooming.dto.UpdateGroomingStaffDTO;
import com.veterinaria.backend.grooming.mapper.GroomingStaffMapper;
import com.veterinaria.backend.grooming.model.GroomingSpecialty;
import com.veterinaria.backend.grooming.model.GroomingStaff;
import com.veterinaria.backend.grooming.repository.GroomingSpecialtyRepository;
import com.veterinaria.backend.grooming.repository.GroomingStaffRepository;
import com.veterinaria.backend.grooming.service.GroomingStaffService;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.role.repository.RoleRepository;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroomingStaffServiceImpl implements GroomingStaffService {

    private final GroomingStaffRepository groomingStaffRepository;
    private final GroomingSpecialtyRepository specialtyRepository;
    private final GroomingStaffMapper groomingStaffMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

    @Override
    @Transactional(readOnly = true)
    public Page<GroomingStaffDTO> getAllGroomingStaffPaginated(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return groomingStaffRepository.findAll(pageable)
                    .map(groomingStaffMapper::toDTO);
        }
        return groomingStaffRepository.search(search, pageable)
                .map(groomingStaffMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroomingStaffDTO> getAllGroomingStaff(String search) {
        if (search == null || search.trim().isEmpty()) {
            return groomingStaffRepository.findAll().stream()
                    .map(groomingStaffMapper::toDTO)
                    .toList();
        }
        return groomingStaffRepository.searchList(search).stream()
                .map(groomingStaffMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GroomingStaffDTO getGroomingStaffById(UUID id) {
        GroomingStaff staff = groomingStaffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Grooming staff member not found"));
        return groomingStaffMapper.toDTO(staff);
    }

    @Override
    @Transactional
    public GroomingStaffDTO createGroomingStaff(CreateGroomingStaffDTO dto) {
        // Enforce role to be GROOMING
        Role role = roleRepository.findByName(RoleNames.GROOMING)
                .orElseThrow(() -> new NotFoundException("Role GROOMING not found"));

        // Check duplicate email
        var existingEmail = userRepository.findByEmail(dto.getEmail());
        if (existingEmail.isPresent() && Boolean.TRUE.equals(existingEmail.get().getIsActive())) {
            throw new ConflictException("Email already exists");
        }

        // Save avatar if present
        String avatarUrl = null;
        if (dto.getAvatar() != null && !dto.getAvatar().isEmpty()) {
            avatarUrl = storageService.save(dto.getAvatar(), StorageFolder.USERS);
        }

        // Reuse existing inactive user or build a new one
        User user = existingEmail.orElseGet(() -> User.builder().email(dto.getEmail()).build());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setUsername(dto.getUsername());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setAvatarUrl(avatarUrl);
        user.setRole(role);
        user.setIsActive(true);

        user = userRepository.saveAndFlush(user);

        // Fetch specialties
        Set<GroomingSpecialty> specialties = (dto.getSpecialtyIds() != null && !dto.getSpecialtyIds().isEmpty())
                ? specialtyRepository.findByIdIn(dto.getSpecialtyIds())
                : new HashSet<>();

        GroomingStaff staff = GroomingStaff.builder()
                .user(user)
                .specialties(specialties)
                .experienceYears(dto.getExperienceYears())
                .hireDate(dto.getHireDate())
                .status("activo")
                .build();

        log.info("Grooming staff created for user: {}", user.getUsername());
        return groomingStaffMapper.toDTO(groomingStaffRepository.saveAndFlush(staff));
    }

    @Override
    @Transactional
    public GroomingStaffDTO updateGroomingStaff(UUID id, UpdateGroomingStaffDTO dto) {
        GroomingStaff staff = groomingStaffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Grooming staff member not found"));

        User user = staff.getUser();

        // Enforce role to be GROOMING
        Role role = roleRepository.findByName(RoleNames.GROOMING)
                .orElseThrow(() -> new NotFoundException("Role GROOMING not found"));

        // Check duplicate email
        if (!user.getEmail().equals(dto.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new ConflictException("Email already exists");
            }
        }

        // Handle avatar updates
        String avatarUrl = storageService.updateFile(dto.getAvatar(), user.getAvatarUrl(), dto.getRemoveAvatar(), StorageFolder.USERS);

        // Update user fields
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setAvatarUrl(avatarUrl);
        user.setRole(role);

        // Sync active state
        if ("inactivo".equalsIgnoreCase(dto.getStatus())) {
            user.setIsActive(false);
        } else if ("activo".equalsIgnoreCase(dto.getStatus())) {
            user.setIsActive(true);
        }
        userRepository.saveAndFlush(user);

        // Fetch specialties
        Set<GroomingSpecialty> specialties = (dto.getSpecialtyIds() != null && !dto.getSpecialtyIds().isEmpty())
                ? specialtyRepository.findByIdIn(dto.getSpecialtyIds())
                : new HashSet<>();

        // Update staff fields
        staff.setSpecialties(specialties);
        staff.setExperienceYears(dto.getExperienceYears());
        staff.setHireDate(dto.getHireDate());
        staff.setStatus(dto.getStatus());

        log.info("Grooming staff updated: {}", user.getUsername());
        return groomingStaffMapper.toDTO(groomingStaffRepository.saveAndFlush(staff));
    }

    @Override
    @Transactional
    public void deleteGroomingStaff(UUID id) {
        GroomingStaff staff = groomingStaffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Grooming staff member not found"));

        User user = staff.getUser();
        user.setIsActive(false);
        userRepository.save(user);

        staff.setStatus("inactivo");
        groomingStaffRepository.save(staff);
        log.info("Grooming staff deactivated: {}", user.getUsername());
    }
}
