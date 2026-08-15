"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Typography,
    Divider,
} from "@mui/material";
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from "./constants";
import ThemeToggle from "@/shared/components/ThemeToggle";
import { useAuthStore } from "@/store/auth.store";
import { AuthService } from "@/features/auth/services/auth.service";

interface HeaderProps {
    onMenuClick: () => void;
    onToggleSidebar: () => void;
    collapsed: boolean;
}

export default function Header({ onMenuClick, onToggleSidebar, collapsed }: HeaderProps) {
    const sidebarWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorEl);

    const displayName = user
        ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username
        : "";
    const initial = (user?.firstName || user?.username || "U").charAt(0).toUpperCase();

    const handleLogout = async () => {
        setAnchorEl(null);
        await AuthService.logout({ accessToken: "", refreshToken: "" });
        router.push("/login");
    };

    return (
        <AppBar
            sx={{
                height: 64,
                width: { md: `calc(100% - ${sidebarWidth}px)` },
                ml: { md: `${sidebarWidth}px` },
                borderBottom: '1px solid',
                borderColor: "divider",
                bgcolor: "background.paper",
                color: "text.primary",
                transition: "width 0.2s ease, margin-left 0.2s ease",
            }}
            elevation={0}
        >
            <Toolbar className="h-full gap-1">
                {/* Hamburger — solo mobile */}
                <IconButton onClick={onMenuClick} edge="start" sx={{ display: { md: "none" } }}>
                    <MenuRoundedIcon />
                </IconButton>

                {/* Colapsar/expandir sidebar — solo desktop */}
                <IconButton onClick={onToggleSidebar} sx={{ display: { xs: "none", md: "flex" } }}>
                    {collapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
                </IconButton>

                <Box className="flex items-center ml-auto" sx={{ gap: 1 }}>
                    <ThemeToggle />

                    {user && (
                        <>
                            <Box
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                aria-label="Cuenta de usuario"
                                role="button"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    cursor: "pointer",
                                    p: 0.5,
                                    pl: 1,
                                    borderRadius: "999px",
                                    "&:hover": { bgcolor: "action.hover" },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: { xs: "none", sm: "flex" },
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        lineHeight: 1.15,
                                        maxWidth: 160,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                        {displayName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {user.role}
                                    </Typography>
                                </Box>
                                <Avatar
                                    src={user.avatarUrl || undefined}
                                    sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "1rem" }}
                                >
                                    {!user.avatarUrl && initial}
                                </Avatar>
                            </Box>

                            <Menu
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={() => setAnchorEl(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                transformOrigin={{ vertical: "top", horizontal: "right" }}
                                slotProps={{ paper: { sx: { minWidth: 220, borderRadius: "10px" } } }}
                            >
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                                        {displayName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {user.email}
                                    </Typography>
                                </Box>
                                <Divider />
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        router.push("/profile");
                                    }}
                                >
                                    <ListItemIcon>
                                        <PersonRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    Mi Perfil
                                </MenuItem>
                                <MenuItem onClick={() => void handleLogout()} sx={{ color: "error.main" }}>
                                    <ListItemIcon>
                                        <LogoutRoundedIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    Cerrar sesión
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    )
}
