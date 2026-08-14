package com.veterinaria.backend.owner.service.Impl;

import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.owner.dto.CreateOwnerDTO;
import com.veterinaria.backend.owner.dto.OwnerDTO;
import com.veterinaria.backend.owner.dto.UpdateOwnerDTO;
import com.veterinaria.backend.owner.mapper.OwnerMapper;
import com.veterinaria.backend.owner.model.Owner;
import com.veterinaria.backend.owner.repository.OwnerRepository;
import com.veterinaria.backend.owner.service.OwnerService;
import com.veterinaria.backend.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {

    private final OwnerRepository ownerRepository;
    private final PetRepository petRepository;
    private final OwnerMapper ownerMapper;

    private OwnerDTO mapToDTOWithPets(Owner owner) {
        long count = petRepository.countByOwnerIdAndStatus(owner.getId(), "activo");
        return ownerMapper.toDTO(owner, count);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerDTO> getAllOwners(String search) {
        if (search == null || search.trim().isEmpty()) {
            return ownerRepository.findAllActive().stream()
                    .map(this::mapToDTOWithPets)
                    .toList();
        }
        return ownerRepository.searchActiveList(search.trim()).stream()
                .map(this::mapToDTOWithPets)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OwnerDTO> getAllOwnersPaginated(String search, String status, Pageable pageable) {
        return ownerRepository.findAll(buildSpecification(search, status), pageable)
                .map(this::mapToDTOWithPets);
    }

    @Override
    @Transactional(readOnly = true)
    public OwnerDTO getOwnerById(UUID id) {
        Owner owner = ownerRepository.findById(id)
                .filter(o -> Boolean.TRUE.equals(o.getIsActive()))
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));
        return mapToDTOWithPets(owner);
    }

    @Override
    @Transactional
    public OwnerDTO createOwner(CreateOwnerDTO dto) {
        if (dto.getDocumentNumber() != null && !dto.getDocumentNumber().trim().isEmpty()) {
            String docNum = dto.getDocumentNumber().trim();
            if (ownerRepository.existsByDocumentNumber(docNum)) {
                throw new ConflictException("Ya existe un cliente registrado con el documento '" + docNum + "'");
            }
        }

        Owner owner = Owner.builder()
                .firstName(dto.getFirstName().trim())
                .lastName(dto.getLastName().trim())
                .documentType(dto.getDocumentType() != null ? dto.getDocumentType().trim() : "DNI")
                .documentNumber(dto.getDocumentNumber() != null && !dto.getDocumentNumber().trim().isEmpty() ? dto.getDocumentNumber().trim() : null)
                .phone(dto.getPhone().trim())
                .email(dto.getEmail() != null && !dto.getEmail().trim().isEmpty() ? dto.getEmail().trim() : null)
                .address(dto.getAddress() != null && !dto.getAddress().trim().isEmpty() ? dto.getAddress().trim() : null)
                .isActive(true)
                .build();

        Owner saved = ownerRepository.saveAndFlush(owner);
        log.info("Owner created: {} {}", saved.getFirstName(), saved.getLastName());
        return mapToDTOWithPets(saved);
    }

    @Override
    @Transactional
    public OwnerDTO updateOwner(UUID id, UpdateOwnerDTO dto) {
        Owner owner = ownerRepository.findById(id)
                .filter(o -> Boolean.TRUE.equals(o.getIsActive()))
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));

        if (dto.getDocumentNumber() != null && !dto.getDocumentNumber().trim().isEmpty()) {
            String newDoc = dto.getDocumentNumber().trim();
            if (!newDoc.equalsIgnoreCase(owner.getDocumentNumber())) {
                if (ownerRepository.existsByDocumentNumber(newDoc)) {
                    throw new ConflictException("Ya existe un cliente registrado con el documento '" + newDoc + "'");
                }
            }
            owner.setDocumentNumber(newDoc);
        } else {
            owner.setDocumentNumber(null);
        }

        owner.setFirstName(dto.getFirstName().trim());
        owner.setLastName(dto.getLastName().trim());
        owner.setDocumentType(dto.getDocumentType() != null ? dto.getDocumentType().trim() : "DNI");
        owner.setPhone(dto.getPhone().trim());
        owner.setEmail(dto.getEmail() != null && !dto.getEmail().trim().isEmpty() ? dto.getEmail().trim() : null);
        owner.setAddress(dto.getAddress() != null && !dto.getAddress().trim().isEmpty() ? dto.getAddress().trim() : null);

        Owner updated = ownerRepository.saveAndFlush(owner);
        log.info("Owner updated: {}", updated.getId());
        return mapToDTOWithPets(updated);
    }

    @Override
    @Transactional
    public void deleteOwner(UUID id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));

        owner.setIsActive(false);
        ownerRepository.saveAndFlush(owner);
        log.info("Owner deactivated: {}", id);
    }

    @Override
    @Transactional
    public void reactivateOwner(UUID id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));

        owner.setIsActive(true);
        ownerRepository.saveAndFlush(owner);
        log.info("Owner reactivated: {}", id);
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private Specification<Owner> buildSpecification(String search, String status) {
        Specification<Owner> spec = (root, query, cb) -> cb.conjunction();

        if (status == null || status.isBlank()) {
            // Por defecto solo se listan clientes activos
            spec = spec.and((root, query, cb) -> cb.isTrue(root.get("isActive")));
        } else if (!"todos".equalsIgnoreCase(status.trim())) {
            boolean activeValue = "activo".equalsIgnoreCase(status.trim());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isActive"), activeValue));
        }
        // status == "todos": sin filtro de estado, se listan todos

        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern),
                    cb.like(cb.lower(cb.coalesce(root.get("documentNumber"), "")), pattern),
                    cb.like(cb.lower(cb.coalesce(root.get("phone"), "")), pattern),
                    cb.like(cb.lower(cb.coalesce(root.get("email"), "")), pattern)
            ));
        }

        return spec;
    }
}
