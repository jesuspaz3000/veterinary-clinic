package com.veterinaria.backend.user.service;

import com.veterinaria.backend.user.dto.CreateUserDTO;
import com.veterinaria.backend.user.dto.ResetPasswordDTO;
import com.veterinaria.backend.user.dto.UpdateUserDTO;
import com.veterinaria.backend.user.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserDTO> getAllUsers(String search);
    Page<UserDTO> getAllUsersPaginated(String search, Pageable pageable);
    UserDTO getUserById(UUID id);

    UserDTO createUser(CreateUserDTO dto);
    UserDTO updateUser(UUID id, UpdateUserDTO dto);
    void deleteUser(UUID id);
    void resetPassword(UUID id, ResetPasswordDTO dto);
}
