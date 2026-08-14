package com.veterinaria.backend.pet.service.Impl;

import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.owner.model.Owner;
import com.veterinaria.backend.owner.repository.OwnerRepository;
import com.veterinaria.backend.pet.dto.CreatePetDTO;
import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.pet.dto.UpdatePetDTO;
import com.veterinaria.backend.pet.mapper.PetMapper;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.pet.service.PetService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final OwnerRepository ownerRepository;
    private final PetMapper petMapper;
    private final StorageService storageService;

    @Override
    @Transactional(readOnly = true)
    public List<PetDTO> getAllPets(String search, UUID ownerId) {
        if (ownerId != null) {
            return petRepository.findByOwnerIdAndStatus(ownerId, "activo").stream()
                    .map(petMapper::toDTO)
                    .toList();
        }
        if (search == null || search.trim().isEmpty()) {
            return petRepository.findAllActive().stream()
                    .map(petMapper::toDTO)
                    .toList();
        }
        return petRepository.searchActiveList(search.trim()).stream()
                .map(petMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PetDTO> getAllPetsPaginated(String search, UUID ownerId, String status, Pageable pageable) {
        return petRepository.findAll(buildSpecification(search, ownerId, status), pageable)
                .map(petMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public PetDTO getPetById(UUID id) {
        Pet pet = petRepository.findById(id)
                .filter(p -> "activo".equalsIgnoreCase(p.getStatus()))
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        return petMapper.toDTO(pet);
    }

    @Override
    @Transactional
    public PetDTO createPet(CreatePetDTO dto) {
        Owner owner = ownerRepository.findById(dto.getOwnerId())
                .filter(o -> Boolean.TRUE.equals(o.getIsActive()))
                .orElseThrow(() -> new NotFoundException("El cliente especificado no existe"));

        if (dto.getMicrochipNumber() != null && !dto.getMicrochipNumber().trim().isEmpty()) {
            String chip = dto.getMicrochipNumber().trim();
            if (petRepository.existsByMicrochipNumber(chip)) {
                throw new ConflictException("Ya existe una mascota registrada con el microchip '" + chip + "'");
            }
        }

        String photoUrl = null;
        if (dto.getPhoto() != null && !dto.getPhoto().isEmpty()) {
            photoUrl = storageService.save(dto.getPhoto(), StorageFolder.PETS);
        }

        Pet pet = Pet.builder()
                .owner(owner)
                .name(dto.getName().trim())
                .species(dto.getSpecies().trim())
                .breed(dto.getBreed() != null && !dto.getBreed().trim().isEmpty() ? dto.getBreed().trim() : null)
                .color(dto.getColor() != null && !dto.getColor().trim().isEmpty() ? dto.getColor().trim() : null)
                .sex(dto.getSex().trim())
                .birthDate(dto.getBirthDate())
                .weight(dto.getWeight())
                .microchipNumber(dto.getMicrochipNumber() != null && !dto.getMicrochipNumber().trim().isEmpty() ? dto.getMicrochipNumber().trim() : null)
                .sterilized(Boolean.TRUE.equals(dto.getSterilized()))
                .photoUrl(photoUrl)
                .status(dto.getStatus() != null && !dto.getStatus().trim().isEmpty() ? dto.getStatus().trim() : "activo")
                .specialNotes(dto.getSpecialNotes() != null && !dto.getSpecialNotes().trim().isEmpty() ? dto.getSpecialNotes().trim() : null)
                .build();

        Pet saved = petRepository.saveAndFlush(pet);
        log.info("Pet created: {} for owner {}", saved.getName(), owner.getId());
        return petMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public PetDTO updatePet(UUID id, UpdatePetDTO dto) {
        Pet pet = petRepository.findById(id)
                .filter(p -> "activo".equalsIgnoreCase(p.getStatus()))
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));

        Owner owner = ownerRepository.findById(dto.getOwnerId())
                .filter(o -> Boolean.TRUE.equals(o.getIsActive()))
                .orElseThrow(() -> new NotFoundException("El cliente especificado no existe"));

        if (dto.getMicrochipNumber() != null && !dto.getMicrochipNumber().trim().isEmpty()) {
            String newChip = dto.getMicrochipNumber().trim();
            if (!newChip.equalsIgnoreCase(pet.getMicrochipNumber())) {
                if (petRepository.existsByMicrochipNumber(newChip)) {
                    throw new ConflictException("Ya existe una mascota registrada con el microchip '" + newChip + "'");
                }
            }
            pet.setMicrochipNumber(newChip);
        } else {
            pet.setMicrochipNumber(null);
        }

        String photoUrl = storageService.updateFile(dto.getPhoto(), pet.getPhotoUrl(), dto.getRemovePhoto(), StorageFolder.PETS);

        pet.setOwner(owner);
        pet.setName(dto.getName().trim());
        pet.setSpecies(dto.getSpecies().trim());
        pet.setBreed(dto.getBreed() != null && !dto.getBreed().trim().isEmpty() ? dto.getBreed().trim() : null);
        pet.setColor(dto.getColor() != null && !dto.getColor().trim().isEmpty() ? dto.getColor().trim() : null);
        pet.setSex(dto.getSex().trim());
        pet.setBirthDate(dto.getBirthDate());
        pet.setWeight(dto.getWeight());
        pet.setSterilized(Boolean.TRUE.equals(dto.getSterilized()));
        pet.setPhotoUrl(photoUrl);
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            pet.setStatus(dto.getStatus().trim());
        }
        pet.setSpecialNotes(dto.getSpecialNotes() != null && !dto.getSpecialNotes().trim().isEmpty() ? dto.getSpecialNotes().trim() : null);

        Pet updated = petRepository.saveAndFlush(pet);
        log.info("Pet updated: {}", updated.getId());
        return petMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deletePet(UUID id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));

        pet.setStatus("inactivo");
        petRepository.saveAndFlush(pet);
        log.info("Pet deactivated: {}", id);
    }

    @Override
    @Transactional
    public void reactivatePet(UUID id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));

        pet.setStatus("activo");
        petRepository.saveAndFlush(pet);
        log.info("Pet reactivated: {}", id);
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private Specification<Pet> buildSpecification(String search, UUID ownerId, String status) {
        Specification<Pet> spec = (root, query, cb) -> cb.conjunction();

        if (ownerId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("owner").get("id"), ownerId));
        }

        if (status == null || status.isBlank()) {
            // Por defecto solo se listan mascotas activas
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), "activo"));
        } else if (!"todos".equalsIgnoreCase(status.trim())) {
            String normalizedStatus = status.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), normalizedStatus));
        }
        // status == "todos": sin filtro de estado, se listan todas

        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                Join<Pet, Owner> owner = root.join("owner", JoinType.LEFT);
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(cb.like(cb.lower(root.get("name")), pattern));
                predicates.add(cb.like(cb.lower(root.get("species")), pattern));
                predicates.add(cb.like(cb.lower(cb.coalesce(root.get("breed"), "")), pattern));
                predicates.add(cb.like(cb.lower(cb.coalesce(root.get("microchipNumber"), "")), pattern));
                predicates.add(cb.like(cb.lower(owner.get("firstName")), pattern));
                predicates.add(cb.like(cb.lower(owner.get("lastName")), pattern));
                predicates.add(cb.like(cb.lower(cb.coalesce(owner.get("documentNumber"), "")), pattern));
                return cb.or(predicates.toArray(new Predicate[0]));
            });
        }

        return spec;
    }
}
