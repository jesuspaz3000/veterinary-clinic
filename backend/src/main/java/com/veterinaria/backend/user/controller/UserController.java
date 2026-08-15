package com.veterinaria.backend.user.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.util.PaginationValidator;
import com.veterinaria.backend.user.dto.ChangePasswordDTO;
import com.veterinaria.backend.user.dto.CreateUserDTO;
import com.veterinaria.backend.user.dto.ResetPasswordDTO;
import com.veterinaria.backend.user.dto.UpdateMyProfileDTO;
import com.veterinaria.backend.user.dto.UpdateUserDTO;
import com.veterinaria.backend.user.dto.UserDTO;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import com.veterinaria.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('USERS_READ')")
    @Operation(summary = "Get all users", description = "Get all users")
    public ResponseEntity<PaginatedResponse<UserDTO>> getAllUsers(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            HttpServletRequest request
    ) {
        if (limit != null) {
            int effectiveOffset = offset != null ? offset : 0;
            Pageable pageable = PaginationValidator.getPageable(limit, effectiveOffset, Sort.by("createdAt").descending());
            Page<UserDTO> usersPage = userService.getAllUsersPaginated(search, status, pageable);
            PaginatedResponse<UserDTO> response = PaginationValidator.buildPaginatedResponse(
                    usersPage,
                    limit,
                    effectiveOffset,
                    request.getRequestURI(),
                    request.getQueryString()
            );
            return ResponseEntity.ok(response);
        } else {
            List<UserDTO> users = userService.getAllUsers(search, status);
            PaginatedResponse<UserDTO> response = PaginatedResponse.<UserDTO>builder()
                    .count((long) users.size())
                    .next(null)
                    .previous(null)
                    .results(new ArrayList<>(users))
                    .build();
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USERS_READ')")
    @Operation(summary = "Get user by id", description = "Get user by id")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('USERS_CREATE')")
    @Operation(summary = "Create user", description = "Create user")
    public ResponseEntity<UserDTO> createUser(@Valid @ModelAttribute CreateUserDTO dto) {
        return ResponseEntity.ok(userService.createUser(dto));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('USERS_UPDATE')")
    @Operation(summary = "Update user", description = "Update user")
    public ResponseEntity<UserDTO> updateUser(@PathVariable UUID id, @Valid @ModelAttribute UpdateUserDTO userDto) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USERS_DELETE')")
    @Operation(summary = "Delete user", description = "Delete user")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('USERS_UPDATE')")
    @Operation(summary = "Reactivate user", description = "Reactivate a previously deactivated user")
    public ResponseEntity<MessageResponse> reactivateUser(@PathVariable UUID id) {
        userService.reactivateUser(id);
        return ResponseEntity.ok(new MessageResponse("User reactivated successfully"));
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @Operation(summary = "Reset user password", description = "Reset a user's password (SUPERADMIN only)")
    public ResponseEntity<MessageResponse> resetPassword(
            @PathVariable UUID id,
            @Valid @RequestBody ResetPasswordDTO dto
    ) {
        userService.resetPassword(id, dto);
        return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my profile", description = "Get the currently authenticated user's own profile")
    public ResponseEntity<UserDTO> getMyProfile(Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update my profile", description = "Update the currently authenticated user's own personal data and avatar")
    public ResponseEntity<UserDTO> updateMyProfile(
            @Valid @ModelAttribute UpdateMyProfileDTO dto,
            Authentication authentication
    ) {
        User currentUser = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(userService.updateMyProfile(currentUser.getId(), dto));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change my password", description = "Change the currently authenticated user's own password")
    public ResponseEntity<MessageResponse> changeMyPassword(
            @Valid @RequestBody ChangePasswordDTO dto,
            Authentication authentication
    ) {
        User currentUser = getAuthenticatedUser(authentication);
        userService.changeMyPassword(currentUser.getId(), dto);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String principal = authentication.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByUsername(principal))
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado."));
    }
}