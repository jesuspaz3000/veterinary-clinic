package com.veterinaria.backend.role.dto;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class RolePaginatedResponse extends PaginatedResponse<RoleDTO> {
}
