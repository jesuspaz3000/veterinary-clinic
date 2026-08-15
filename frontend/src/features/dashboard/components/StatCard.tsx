import { Box, Paper, Typography, Skeleton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

export type StatCardColor = "primary" | "secondary" | "success" | "warning" | "error" | "info";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ComponentType<SvgIconProps>;
    color: StatCardColor;
    loading?: boolean;
    highlight?: boolean;
}

export default function StatCard({ label, value, icon: Icon, color, loading, highlight }: StatCardProps) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2.5,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderColor: highlight ? `${color}.main` : undefined,
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    minWidth: 48,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.14),
                    color: `${color}.main`,
                }}
            >
                <Icon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                {loading ? (
                    <Skeleton variant="text" width={60} height={32} />
                ) : (
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
                        {value}
                    </Typography>
                )}
                <Typography variant="body2" color="text.secondary" noWrap>
                    {label}
                </Typography>
            </Box>
        </Paper>
    );
}
