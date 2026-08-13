'use client';

import { IconButton, Tooltip } from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { useThemeMode } from "@/providers/ThemeRegistry";

interface ThemeToggleProps {
    floating?: boolean;
}

export default function ThemeToggle({ floating = false }: ThemeToggleProps) {
    const { mode, toggleTheme } = useThemeMode();

    return (
        <Tooltip title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <IconButton
                onClick={toggleTheme}
                className={floating ? 'fixed top-4 right-4 opacity-100 hover:opacity-85' : ''}
                sx={floating ? {
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    '&:hover': { bgcolor: 'background.paper' },
                } : {}}
            >
                {mode === 'dark'
                    ? <LightModeRoundedIcon />
                    : <DarkModeRoundedIcon />
                }
            </IconButton>
        </Tooltip>
    );
}
