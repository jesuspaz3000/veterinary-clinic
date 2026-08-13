"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    TablePagination,
    Box,
    LinearProgress,
    Typography,
    Skeleton,
    Alert,
    AlertTitle,
} from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export interface Column<T> {
    id: string;
    label: string;
    minWidth?: number;
    align?: "left" | "right" | "center";
    render?: (row: T, index: number) => React.ReactNode;
}

interface CustomTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    error?: Error | string | null;

    // Selection
    selectable?: boolean;
    selected?: (string | number)[];
    onSelectChange?: (selectedIds: (string | number)[]) => void;
    getRowId?: (row: T) => string | number;

    // Pagination
    page: number; // 0-indexed
    rowsPerPage: number;
    totalElements?: number;
    count?: number;
    onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    rowsPerPageOptions?: number[];

    // Empty state
    emptyMessage?: string;
}

export default function CustomTable<T>({
    columns,
    data,
    loading = false,
    error = null,
    selectable = false,
    selected = [],
    onSelectChange,
    getRowId,
    page,
    rowsPerPage,
    totalElements,
    count,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50],
    emptyMessage = "No se encontraron registros",
}: CustomTableProps<T>) {
    // Helper to get unique row ID
    const getId = (row: T, index: number): string | number => {
        if (getRowId) return getRowId(row);
        const record = row as Record<string, unknown>;
        if (record && typeof record === "object") {
            if (record.id !== undefined && record.id !== null) {
                return record.id as string | number;
            }
            if (record._id !== undefined && record._id !== null) {
                return record._id as string | number;
            }
        }
        return index;
    };

    const isSelected = (row: T, index: number) => {
        return selected.includes(getId(row, index));
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!onSelectChange) return;

        if (event.target.checked) {
            const newSelecteds = data.map((row, index) => getId(row, index));
            onSelectChange(newSelecteds);
        } else {
            onSelectChange([]);
        }
    };

    const handleRowClick = (row: T, index: number, event: React.MouseEvent) => {
        // Prevent triggering selection when clicking on interactive components (buttons, links, inputs)
        const target = event.target as HTMLElement;
        if (
            target.closest("button") ||
            target.closest("a") ||
            (target.closest("input") && !target.closest(".MuiCheckbox-root")) ||
            target.closest("select") ||
            target.closest("[role='button']")
        ) {
            return;
        }

        if (!selectable || !onSelectChange) return;

        const id = getId(row, index);
        const selectedIndex = selected.indexOf(id);
        let newSelected: (string | number)[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else {
            newSelected = selected.filter((item) => item !== id);
        }

        onSelectChange(newSelected);
    };

    const allSelected = data.length > 0 && selected.length === data.length;
    const someSelected = selected.length > 0 && selected.length < data.length;

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                overflow: "hidden",
                position: "relative",
                borderRadius: "16px",
                border: "1px solid",
                borderColor: (theme) =>
                    theme.palette.mode === "light" ? "rgba(26, 153, 153, 0.2)" : "divider",
                bgcolor: "background.paper",
                backdropFilter: "blur(8px)",
                boxShadow: (theme) =>
                    theme.palette.mode === "light"
                        ? "0 4px 20px rgba(13, 31, 45, 0.08), 0 1px 3px rgba(13, 31, 45, 0.04)"
                        : "0 4px 30px rgba(0, 0, 0, 0.2)",
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                "&:hover": {
                    boxShadow: (theme) =>
                        theme.palette.mode === "light"
                            ? "0 10px 30px rgba(13, 31, 45, 0.12), 0 1px 5px rgba(13, 31, 45, 0.06)"
                            : "0 8px 40px rgba(0, 0, 0, 0.3)",
                },
            }}
        >
            {/* Dynamic sleek loading bar */}
            {loading && (
                <LinearProgress
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        borderTopLeftRadius: "16px",
                        borderTopRightRadius: "16px",
                        zIndex: 10,
                    }}
                />
            )}

            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="custom dynamic table">
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell
                                    padding="checkbox"
                                    sx={{
                                        bgcolor: "background.tableHeader",
                                        borderBottom: "2px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Checkbox
                                        color="primary"
                                        indeterminate={someSelected}
                                        checked={allSelected}
                                        onChange={handleSelectAllClick}
                                        slotProps={{
                                            input: {
                                                "aria-label": "seleccionar todas las filas",
                                            },
                                        }}
                                    />
                                </TableCell>
                            )}
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || "left"}
                                    style={{ minWidth: column.minWidth }}
                                    sx={{
                                        bgcolor: "background.tableHeader",
                                        color: "text.primary",
                                        fontWeight: 650,
                                        textTransform: "uppercase",
                                        fontSize: "0.75rem",
                                        letterSpacing: "0.08em",
                                        borderBottom: "2px solid",
                                        borderColor: "divider",
                                        py: 2,
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {error ? (
                            // Error state row
                            <TableRow>
                                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center">
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            py: 6,
                                            px: 2,
                                            gap: 2,
                                        }}
                                    >
                                        <Alert severity="error" sx={{ minWidth: { xs: "100%", sm: 350 }, borderRadius: "10px" }}>
                                            <AlertTitle sx={{ fontWeight: 700 }}>Error al cargar datos</AlertTitle>
                                            {typeof error === "string" ? error : error?.message || "No se pudieron obtener los registros desde el servidor."}
                                        </Alert>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : loading && data.length === 0 ? (
                            // Skeleton loading rows
                            Array.from(new Array(5)).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`}>
                                    {selectable && (
                                        <TableCell padding="checkbox" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                                            <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: "4px" }} />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell key={`skeleton-${rowIndex}-${column.id}`} sx={{ borderBottom: "1px solid", borderColor: "divider", py: 2.2 }}>
                                            <Skeleton variant="text" width={column.id === "index" ? 20 : "75%"} height={20} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data.length > 0 ? (
                            data.map((row, index) => {
                                const isItemSelected = isSelected(row, index);
                                const rowId = getId(row, index);

                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) => handleRowClick(row, index, event)}
                                        role={selectable ? "checkbox" : "row"}
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={rowId}
                                        selected={isItemSelected}
                                        sx={{
                                            cursor: selectable ? "pointer" : "default",
                                            transition: "background-color 0.2s ease, transform 0.2s ease",
                                            "&.Mui-selected": {
                                                bgcolor: "action.selected",
                                                "&:hover": {
                                                    bgcolor: "action.selected",
                                                },
                                            },
                                            "&:last-child td, &:last-child th": {
                                                border: 0,
                                            },
                                        }}
                                    >
                                        {selectable && (
                                            <TableCell padding="checkbox" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    slotProps={{
                                                        input: {
                                                            "aria-labelledby": `table-checkbox-${rowId}`,
                                                        },
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((column) => {
                                            const record = row as Record<string, React.ReactNode>;
                                            const value = record[column.id];
                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align || "left"}
                                                    sx={{
                                                        color: "text.primary",
                                                        fontSize: "0.875rem",
                                                        py: 1.75,
                                                        borderBottom: "1px solid",
                                                        borderColor: "divider",
                                                    }}
                                                >
                                                    {column.render ? column.render(row, index) : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        ) : (
                            // Empty state row
                            <TableRow>
                                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center">
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            py: 6,
                                            gap: 2,
                                        }}
                                    >
                                        <InboxOutlinedIcon
                                            sx={{
                                                fontSize: 60,
                                                color: "text.secondary",
                                                opacity: 0.5,
                                             }}
                                        />
                                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            {emptyMessage}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination control */}
            <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={totalElements ?? count ?? 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
                sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            />
        </Paper>
    );
}
