package com.veterinaria.backend.role.repository;

import com.veterinaria.backend.role.model.Permission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    Optional<Permission> findByName(String name);

    @Query("SELECT p FROM Permission p WHERE p.name LIKE CONCAT('%', :search, '%')")
    List<Permission> findBySearch(@Param("search") String search);

    List<Permission> findByModule(String module);

    List<Permission> findByModuleNotOrderByIdAsc(String module);

    Page<Permission> findByModuleNotOrderByIdAsc(String module, Pageable pageable);

    boolean existsByName(String name);

    Set<Permission> findByIdIn(Set<UUID> ids);

    List<Permission> findByNameIn(Collection<String> names);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE module = :module)", nativeQuery = true)
    int deleteRolePermissionLinksForModule(@Param("module") String module);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM permissions WHERE module = :module", nativeQuery = true)
    int deletePermissionsByModule(@Param("module") String module);
}
