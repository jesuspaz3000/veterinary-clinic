import { createTheme, type ThemeOptions } from "@mui/material/styles";

const tableChrome: ThemeOptions["components"] = {
    MuiTableCell: {
        styleOverrides: {
            head: ({ theme }) => ({
                backgroundColor: theme.palette.background.tableHeader,
                fontWeight: 700,
            }),
        },
    },
    MuiTablePagination: {
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: theme.palette.background.tableHeader,
                borderTop: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
            }),
            toolbar: ({ theme }) => ({
                backgroundColor: theme.palette.background.tableHeader,
            }),
            selectIcon: { color: "inherit" },
            actions: { color: "inherit" },
        },
    },
};

// Extraído del logo: teal degradado exterior + azul marino interior
const dark = {
    accent: "#2ABFBF",      // teal del círculo exterior
    accentDeep: "#1A5F7A",  // teal más profundo para hover/variantes
    bg: "#0D1117",           // casi negro con tinte azulado (coherente con navy del logo)
    surface: "#161B24",      // superficie elevada
    tableHeader: "#1E2530",
    input: "#0D1117",
    text: "#E8F4F4",         // blanco con leve tinte teal
    muted: "#7A9BAA",        // azul grisáceo apagado
    facebook: "#4267B2",
} as const;

const light = {
    accent: "#1A9999",       // teal más saturado en light (oscurece para contraste)
    accentDeep: "#136E6E",
    bg: "#F0F7F7",           // blanco con leve tinte teal, no frío puro
    surface: "#FFFFFF",
    tableHeader: "#E4F0F0",  // teal muy lavado
    input: "#EAF3F3",
    text: "#0D1F2D",         // navy oscuro del logo
    muted: "#5A7D8A",
    facebook: "#4267B2",
} as const;

declare module "@mui/material/styles" {
    interface TypeBackground {
        card: string;
        input: string;
        tableHeader: string;
    }
}

const typography = {
    fontFamily: "var(--font-roboto), sans-serif",
};

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: dark.accent,
            contrastText: "#0D1117",
        },
        secondary: {
            main: dark.accentDeep,
            contrastText: "#E8F4F4",
        },
        text: {
            primary: dark.text,
            secondary: dark.muted,
            disabled: "rgba(122, 155, 170, 0.4)",
        },
        background: {
            default: dark.bg,
            paper: dark.surface,
            card: dark.surface,
            input: dark.input,
            tableHeader: dark.tableHeader,
        },
        divider: "rgba(42, 191, 191, 0.1)",
        action: {
            active: dark.muted,
            hover: "rgba(42, 191, 191, 0.08)",
            selected: "rgba(42, 191, 191, 0.16)",
        },
    },
    typography,
    components: {
        ...tableChrome,
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none", // elimina el overlay de elevación en dark mode
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    padding: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                },
            },
        },
    },
});

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: light.accent,
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: light.accentDeep,
            contrastText: "#FFFFFF",
        },
        text: {
            primary: light.text,
            secondary: light.muted,
            disabled: "rgba(90, 125, 138, 0.4)",
        },
        background: {
            default: light.bg,
            paper: light.surface,
            card: light.surface,
            input: light.input,
            tableHeader: light.tableHeader,
        },
        divider: "rgba(26, 153, 153, 0.12)",
        action: {
            active: light.muted,
            hover: "rgba(26, 153, 153, 0.08)",
            selected: "rgba(26, 153, 153, 0.12)",
        },
    },
    typography,
    components: {
        ...tableChrome,
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none", // elimina el overlay de elevación en dark mode
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    padding: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                },
            },
        },
    },
});