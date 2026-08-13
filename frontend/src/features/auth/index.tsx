"use client"

import { useState } from "react";
import { useAuthLogin } from "./hooks/authHooks";
import { Box, TextField, Button, Paper, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoginValidationErrors, validateLoginForm, hasValidationErrors } from "./utils/authUtils";
import ThemeToggle from "@/shared/components/ThemeToggle";

export function LoginForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuthLogin();
    const [isPending, setIsPending] = useState(false);
    const [errors, setErrors] = useState<LoginValidationErrors>({});

    const router = useRouter();

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = validateLoginForm(email, password);
        if (hasValidationErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        setIsPending(true);
        try {
            const response = await login({ email, password });
            if (response) {
                router.push("/dashboard");
            } else {
                setIsPending(false);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Credenciales incorrectas";
            setErrors({ password: message });
            setIsPending(false);
        }
    }

    return (
        <Box className="w-full h-screen flex items-center justify-center flex-col">
            <Paper elevation={3} className="flex flex-col gap-10 p-10 rounded-2xl" component="form" onSubmit={handleSubmit}>
                <Box className="flex items-center justify-center">
                    <Box className="relative bg-white rounded-full w-40 h-40 flex items-center justify-center">
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            width={200}
                            height={200}
                            className="object-contain"
                            loading="eager"
                        />
                    </Box>
                </Box>
                <Typography className="text-3xl text-center">
                    Iniciar sesión
                </Typography>
                <TextField
                    type="text"
                    value={email}
                    variant="outlined"
                    label="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-100"
                    autoComplete="new-email"
                    disabled={isPending}
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    type="password"
                    value={password}
                    variant="outlined"
                    label="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-100"
                    autoComplete="new-password"
                    disabled={isPending}
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <Button type="submit" variant="contained" loading={isPending} disabled={isPending}>
                    Login
                </Button>
            </Paper>
            <ThemeToggle floating={true} />
        </Box>
    )
}