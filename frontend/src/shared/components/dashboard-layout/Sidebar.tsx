"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HEADER_HEIGHT } from "./constants";
import { Drawer, Box, Tooltip, IconButton, List, ListItem, ListItemButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { SxProps, Theme } from "@mui/material";
import { useAuthStore } from "@/store/auth.store";
import { AuthService } from "@/features/auth/services/auth.service";
import { navItems } from "@/shared/config/navigation";
import Link from "next/link";

interface SidebarProps {
    collapsed?: boolean;
    open: boolean;
    onMobileClose?: () => void;
    sx: SxProps<Theme>;
    variant: 'permanent' | 'temporary';
    userPermissions?: string[];
}

export default function Sidebar({ collapsed, onMobileClose, open, sx, variant, userPermissions }: SidebarProps) {
    const router = useRouter();
    const hasPermission = useAuthStore((s) => s.hasPermission);
    const hasHydrated = useAuthStore((s) => s._hasHydrated);
    const pathname = usePathname();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await AuthService.logout({
                accessToken: "",
                refreshToken: ""
            });
            router.push("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setLogoutLoading(false);
            setConfirmOpen(false);
        }
    }

    const visibleItems = userPermissions && userPermissions.length > 0
        ? navItems.filter((item) => !item.permission || userPermissions.includes(item.permission))
        : hasHydrated
            ? navItems.filter((item) => !item.permission || hasPermission(item.permission))
            : navItems.filter((item) => !item.permission);

    return (
        <Drawer
            sx={sx}
            open={open}
            ModalProps={{ keepMounted: true }}
            variant={variant}
        >
            <Box
                sx={{
                    height: HEADER_HEIGHT,
                    minHeight: HEADER_HEIGHT,
                    pl: collapsed ? 0 : 2,
                    pr: onMobileClose ? 0.5 : collapsed ? 0 : 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: onMobileClose ? "space-between" : collapsed ? "center" : "flex-start",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    gap: collapsed && !onMobileClose ? 1 : 1.75,
                }}
            >
                {onMobileClose && (
                    <Tooltip title="Cerrar menú" placement="left" arrow>
                        <IconButton
                            onClick={onMobileClose}
                            aria-label="Cerrar menú de navegación"
                            edge="end"
                            size="small"
                            sx={{
                                color: "text.secondary",
                                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                            }}
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <List disablePadding sx={{ flexGrow: 1, pt: 2, px: 1 }}>
                {visibleItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <ListItem key={href} disablePadding sx={{ mb: 0.5, display: "flex", justifyContent: "center" }}>
                            <Tooltip title={collapsed ? label : ""} placement="right">
                                <ListItemButton
                                    component={Link}
                                    href={href}
                                    onClick={() => onMobileClose?.()}
                                    selected={isActive}
                                    sx={{
                                        borderRadius: 2,
                                        p: 0,
                                        height: 44,
                                        width: "100%",
                                        minWidth: 44,
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        overflow: "hidden",
                                        transition: "min-width 0.2s ease",
                                        "&.Mui-selected": {
                                            bgcolor: "primary.main",
                                            color: "primary.contrastText",
                                            "&:hover": { bgcolor: "primary.main" },
                                        },
                                    }}
                                >
                                    <Box sx={{
                                        width: 44,
                                        minWidth: 44,
                                        height: 44,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        pl: 0.5
                                    }}>
                                        <Icon fontSize="small" />
                                    </Box>

                                    <Box sx={{
                                        maxWidth: collapsed ? 0 : 200,
                                        opacity: collapsed ? 0 : 1,
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        transition: "max-width 0.2s ease, opacity 0.15s ease",
                                        pr: collapsed ? 0 : 1.5,
                                    }}>
                                        {label}
                                    </Box>
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    )
                })}
            </List>

            <Box sx={{ px: 1, pb: 2 }}>
                <Tooltip title={collapsed ? "Cerrar sesión" : ""} placement="right">
                    <ListItemButton
                        onClick={() => {
                            onMobileClose?.();
                            setConfirmOpen(true);
                        }}
                        sx={{
                            borderRadius: 2,
                            p: 0,
                            height: 44,
                            width: "100%",
                            minWidth: 44,
                            display: "flex",
                            justifyContent: "flex-start",
                            overflow: "hidden",
                            transition: "min-width 0.2s ease, border-color 0.2s ease",
                            bgcolor: "transparent",
                            border: "1px solid",
                            borderColor: "error.dark",
                            color: "error.dark",
                            "&:hover": {
                                bgcolor: "error.main",
                                color: "error.contrastText",
                            },
                        }}
                    >
                        <Box sx={{
                            width: 44,
                            minWidth: 44,
                            height: 44,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            pl: 0.5
                        }}>
                            <LogoutRoundedIcon fontSize="small" />
                        </Box>

                        <Box sx={{
                            maxWidth: collapsed ? 0 : 200,
                            opacity: collapsed ? 0 : 1,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            transition: "max-width 0.2s ease, opacity 0.15s ease",
                            pr: collapsed ? 0 : 1.5,
                        }}>
                            Cerrar sesión
                        </Box>
                    </ListItemButton>
                </Tooltip>
            </Box>
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
                disableRestoreFocus
            >
                <DialogTitle>¿Cerrar sesión?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tu sesión será cerrada y serás redirigido al inicio de sesión.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={logoutLoading}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => void handleLogout()}
                        disabled={logoutLoading}
                    >
                        {logoutLoading ? "Cerrando…" : "Cerrar sesión"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Drawer>
    )
}