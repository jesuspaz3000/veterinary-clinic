package com.veterinaria.backend.common.constants;

import java.util.Set;

public final class RoleNames {
    public static final String SUPERADMIN = "SUPERADMIN";
    public static final String ADMIN = "ADMIN";
    public static final String VETERINARIAN = "VETERINARIAN";
    public static final String GROOMING = "GROOMING";
    public static final String ADMINISTRATIVE = "ADMINISTRATIVE";

    public static final Set<String> SYSTEM_ROLES = Set.of(SUPERADMIN, ADMIN, VETERINARIAN, GROOMING);

    private RoleNames() {
    }
}
