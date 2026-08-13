"use client";

import { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SalesTable from "./components/SalesTable";
import KardexTable from "./components/KardexTable";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `sales-tab-${index}`,
    "aria-controls": `sales-tabpanel-${index}`,
  };
}

export default function SalesFeature() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Title Header */}
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Ventas y Facturación (POS)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Emisión de comprobantes (Boletas/Facturas/Tickets), punto de venta, pagos mixtos y auditoría de Kardex por FEFO.
        </Typography>
      </Box>

      {/* Tabs navigation */}
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            width: "100%",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="tabs para ventas y facturacion"
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                bgcolor: "primary.main",
              },
            }}
          >
            <Tab
              icon={<ReceiptLongRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Comprobantes y Ventas"
              {...a11yProps(0)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                minHeight: 52,
                gap: 1,
                fontSize: "0.95rem",
              }}
            />
            <Tab
              icon={<HistoryRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Kardex de Movimientos"
              {...a11yProps(1)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                minHeight: 52,
                gap: 1,
                fontSize: "0.95rem",
              }}
            />
          </Tabs>
        </Box>

        <CustomTabPanel value={activeTab} index={0}>
          <SalesTable />
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={1}>
          <KardexTable />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
