package com.veterinaria.backend.veterinarian.service.Impl;

import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.role.repository.RoleRepository;
import com.veterinaria.backend.specialty.model.Specialty;
import com.veterinaria.backend.specialty.repository.SpecialtyRepository;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import com.veterinaria.backend.veterinarian.dto.CreateVeterinarianDTO;
import com.veterinaria.backend.veterinarian.dto.UpdateVeterinarianDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import com.veterinaria.backend.veterinarian.mapper.VeterinarianMapper;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import com.veterinaria.backend.veterinarian.service.VeterinarianService;
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
public class VeterinarianServiceImpl implements VeterinarianService {
    private final VeterinarianRepository veterinarianRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SpecialtyRepository specialtyRepository;
    private final PasswordEncoder passwordEncoder;
    private final VeterinarianMapper veterinarianMapper;
    private final StorageService storageService;

    @Override
    @Transactional(readOnly = true)
    public List<VeterinarianDTO> getAllVeterinarians(String search) {
        if (search == null || search.trim().isEmpty()) {
            return veterinarianRepository.findAll().stream()
                    .map(veterinarianMapper::toDTO)
                    .toList();
        }
        return veterinarianRepository.searchList(search).stream()
                .map(veterinarianMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VeterinarianDTO> getAllVeterinariansPaginated(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return veterinarianRepository.findAll(pageable)
                    .map(veterinarianMapper::toDTO);
        }
        return veterinarianRepository.search(search, pageable)
                .map(veterinarianMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public VeterinarianDTO getVeterinarianById(UUID id) {
        Veterinarian vet = veterinarianRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found"));
        return veterinarianMapper.toDTO(vet);
    }

    @Override
    @Transactional
    public VeterinarianDTO createVeterinarian(CreateVeterinarianDTO dto) {
        // Enforce role to be VETERINARIAN
        Role role = roleRepository.findByName(RoleNames.VETERINARIAN)
                .orElseThrow(() -> new NotFoundException("Role VETERINARIAN not found"));

        // Check duplicate email
        var existingEmail = userRepository.findByEmail(dto.getEmail());
        if (existingEmail.isPresent() && Boolean.TRUE.equals(existingEmail.get().getIsActive())) {
            throw new ConflictException("Email already exists");
        }

        // Check duplicate license number
        if (veterinarianRepository.existsByLicenseNumber(dto.getLicenseNumber())) {
            throw new ConflictException("License number already exists");
        }

        // Save avatar if present
        String avatarUrl = null;
        if (dto.getAvatar() != null && !dto.getAvatar().isEmpty()) {
            avatarUrl = storageService.save(dto.getAvatar(), StorageFolder.USERS);
        }

        // Resolve specialties
        Set<Specialty> specialties = (dto.getSpecialtyIds() != null && !dto.getSpecialtyIds().isEmpty())
                ? specialtyRepository.findByIdIn(dto.getSpecialtyIds())
                : new HashSet<>();

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

        Veterinarian vet = Veterinarian.builder()
                .user(user)
                .licenseNumber(dto.getLicenseNumber())
                .specialties(specialties)
                .hireDate(dto.getHireDate())
                .status("activo")
                .build();

        return veterinarianMapper.toDTO(veterinarianRepository.saveAndFlush(vet));
    }

    @Override
    @Transactional
    public VeterinarianDTO updateVeterinarian(UUID id, UpdateVeterinarianDTO dto) {
        Veterinarian vet = veterinarianRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found"));

        User user = vet.getUser();

        // Enforce role to be VETERINARIAN
        Role role = roleRepository.findByName(RoleNames.VETERINARIAN)
                .orElseThrow(() -> new NotFoundException("Role VETERINARIAN not found"));

        // Check duplicate email
        if (!user.getEmail().equals(dto.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new ConflictException("Email already exists");
            }
        }

        // Check duplicate license number
        if (!vet.getLicenseNumber().equals(dto.getLicenseNumber())) {
            if (veterinarianRepository.existsByLicenseNumber(dto.getLicenseNumber())) {
                throw new ConflictException("License number already exists");
            }
        }

        // Resolve specialties
        Set<Specialty> specialties = (dto.getSpecialtyIds() != null && !dto.getSpecialtyIds().isEmpty())
                ? specialtyRepository.findByIdIn(dto.getSpecialtyIds())
                : new HashSet<>();

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

        // If veterinarian status is inactive, also deactivate user
        if ("inactivo".equalsIgnoreCase(dto.getStatus())) {
            user.setIsActive(false);
        } else if ("activo".equalsIgnoreCase(dto.getStatus())) {
            user.setIsActive(true);
        }
        userRepository.saveAndFlush(user);

        // Update veterinarian fields
        vet.setLicenseNumber(dto.getLicenseNumber());
        vet.setSpecialties(specialties);
        vet.setHireDate(dto.getHireDate());
        vet.setStatus(dto.getStatus());

        return veterinarianMapper.toDTO(veterinarianRepository.saveAndFlush(vet));
    }

    @Override
    @Transactional
    public void deleteVeterinarian(UUID id) {
        Veterinarian vet = veterinarianRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found"));

        vet.setStatus("inactivo");
        veterinarianRepository.save(vet);

        User user = vet.getUser();
        if (user != null) {
            user.setIsActive(false);
            userRepository.save(user);
        }
        log.info("Veterinarian deactivated: {}", id);
    }
}
