package com.veterinaria.backend.administrative.service.Impl;

import com.veterinaria.backend.administrative.dto.AdministrativeStaffDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativeStaffDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativeStaffDTO;
import com.veterinaria.backend.administrative.mapper.AdministrativeStaffMapper;
import com.veterinaria.backend.administrative.model.AdministrativeArea;
import com.veterinaria.backend.administrative.model.AdministrativePosition;
import com.veterinaria.backend.administrative.model.AdministrativeStaff;
import com.veterinaria.backend.administrative.repository.AdministrativeAreaRepository;
import com.veterinaria.backend.administrative.repository.AdministrativePositionRepository;
import com.veterinaria.backend.administrative.repository.AdministrativeStaffRepository;
import com.veterinaria.backend.administrative.service.AdministrativeStaffService;
import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
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
public class AdministrativeStaffServiceImpl implements AdministrativeStaffService {
    private final AdministrativeStaffRepository administrativeStaffRepository;
    private final AdministrativePositionRepository positionRepository;
    private final AdministrativeAreaRepository areaRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdministrativeStaffMapper administrativeStaffMapper;
    private final StorageService storageService;

    @Override
    @Transactional(readOnly = true)
    public List<AdministrativeStaffDTO> getAllAdministrativeStaff(String search) {
        if (search == null || search.trim().isEmpty()) {
            return administrativeStaffRepository.findAllAdministrative().stream()
                    .map(administrativeStaffMapper::toDTO)
                    .toList();
        }
        return administrativeStaffRepository.searchList(search).stream()
                .map(administrativeStaffMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdministrativeStaffDTO> getAllAdministrativeStaffPaginated(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return administrativeStaffRepository.findAllAdministrativePaginated(pageable)
                    .map(administrativeStaffMapper::toDTO);
        }
        return administrativeStaffRepository.search(search, pageable)
                .map(administrativeStaffMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public AdministrativeStaffDTO getAdministrativeStaffById(UUID id) {
        AdministrativeStaff staff = administrativeStaffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative staff not found"));
        return administrativeStaffMapper.toDTO(staff);
    }

    @Override
    @Transactional
    public AdministrativeStaffDTO createAdministrativeStaff(CreateAdministrativeStaffDTO dto) {
        // Enforce role to be ADMINISTRATIVE
        Role role = roleRepository.findByName(RoleNames.ADMINISTRATIVE)
                .orElseGet(() -> roleRepository.findByName(RoleNames.ADMIN)
                        .orElseThrow(() -> new NotFoundException("Role ADMINISTRATIVE not found")));

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

        // Resolve positions
        Set<AdministrativePosition> positions = (dto.getPositionIds() != null && !dto.getPositionIds().isEmpty())
                ? positionRepository.findByIdIn(dto.getPositionIds())
                : new HashSet<>();

        // Resolve area
        AdministrativeArea area = (dto.getAreaId() != null)
                ? areaRepository.findById(dto.getAreaId()).orElse(null)
                : null;

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

        AdministrativeStaff staff = AdministrativeStaff.builder()
                .user(user)
                .positions(positions)
                .assignedArea(area)
                .build();

        return administrativeStaffMapper.toDTO(administrativeStaffRepository.saveAndFlush(staff));
    }

    @Override
    @Transactional
    public AdministrativeStaffDTO updateAdministrativeStaff(UUID id, UpdateAdministrativeStaffDTO dto) {
        AdministrativeStaff staff = administrativeStaffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative staff not found"));

        User user = staff.getUser();

        // Enforce role to be ADMINISTRATIVE
        Role role = roleRepository.findByName(RoleNames.ADMINISTRATIVE)
                .orElseGet(() -> roleRepository.findByName(RoleNames.ADMIN)
                        .orElseThrow(() -> new NotFoundException("Role ADMINISTRATIVE not found")));

        // Check duplicate email
        if (!user.getEmail().equals(dto.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new ConflictException("Email already exists");
            }
        }

        // Resolve positions
        Set<AdministrativePosition> positions = (dto.getPositionIds() != null && !dto.getPositionIds().isEmpty())
                ? positionRepository.findByIdIn(dto.getPositionIds())
                : new HashSet<>();

        // Resolve area
        AdministrativeArea area = (dto.getAreaId() != null)
                ? areaRepository.findById(dto.getAreaId()).orElse(null)
                : null;

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
        user.setIsActive(true);
        userRepository.saveAndFlush(user);

        // Update administrative staff fields
        staff.setPositions(positions);
        staff.setAssignedArea(area);

        return administrativeStaffMapper.toDTO(administrativeStaffRepository.saveAndFlush(staff));
    }

    @Override
    @Transactional
    public void deleteAdministrativeStaff(UUID id) {
        AdministrativeStaff staff = administrativeStaffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative staff not found"));

        User user = staff.getUser();
        if (user != null) {
            user.setIsActive(false);
            userRepository.saveAndFlush(user);
        }
        log.info("Administrative staff deactivated: {}", id);
    }
}
