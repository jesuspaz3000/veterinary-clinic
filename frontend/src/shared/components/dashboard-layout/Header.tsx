import { AppBar, Toolbar, IconButton, Box } from "@mui/material";
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from "./constants";
import ThemeToggle from "@/shared/components/ThemeToggle";


interface HeaderProps {
    onMenuClick: () => void;
    onToggleSidebar: () => void;
    collapsed: boolean;
}

export default function Header({ onMenuClick, onToggleSidebar, collapsed }: HeaderProps) {
    const sidebarWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

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

                <Box className="flex items-center ml-auto">
                    <ThemeToggle />
                </Box>
            </Toolbar>
        </AppBar>
    )
}