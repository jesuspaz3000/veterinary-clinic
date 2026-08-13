"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED, HEADER_HEIGHT } from "./constants";
import { Box } from "@mui/material";

export default function DashboardLayout({ 
    children, 
    userPermissions 
}: { 
    children: React.ReactNode; 
    userPermissions?: string[];
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const sidebarWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Sidebar */}
            <Sidebar
                onMobileClose={() => setMobileOpen(false)}
                open={mobileOpen}
                variant="temporary"
                userPermissions={userPermissions}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: DRAWER_WIDTH,
                        boxSizing: "border-box",
                        bgcolor: "background.paper",
                    },
                }}
            />

            <Sidebar
                collapsed={collapsed}
                open
                variant="permanent"
                userPermissions={userPermissions}
                sx={{
                    display: { xs: "none", md: "flex" },
                    width: sidebarWidth,
                    flexShrink: 0,
                    transition: "width 0.2s ease",
                    "& .MuiDrawer-paper": {
                        width: sidebarWidth,
                        boxSizing: "border-box",
                        overflowX: "hidden",
                        transition: "width 0.2s ease",
                    },
                }}
            />

            {/* Contenedor del contenido */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    transition: "width 0.2s ease",
                    width: { md: `calc(100% - ${sidebarWidth}px)` },
                }}
            >
                <Header
                    onMenuClick={() => setMobileOpen((prev) => !prev)}
                    onToggleSidebar={() => setCollapsed((prev) => !prev)}
                    collapsed={collapsed}
                />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 },
                        mt: `${HEADER_HEIGHT}px`,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    )
}