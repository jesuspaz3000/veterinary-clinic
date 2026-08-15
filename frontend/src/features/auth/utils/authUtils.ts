// authUtils.ts

export interface LoginValidationErrors {
    email?: string;
    password?: string;
}

export function validateLoginForm(email: string, password: string): LoginValidationErrors {
    const errors: LoginValidationErrors = {};

    // Email
    if (!email.trim()) {
        errors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Ingresa un correo válido";
    }

    // Password
    if (!password) {
        errors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
        errors.password = "Mínimo 6 caracteres";
    }

    return errors;
}

export function hasValidationErrors(errors: LoginValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}