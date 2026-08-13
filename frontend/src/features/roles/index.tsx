"use client";

import { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import RolesTable from "./components/RolesTable";
import PermissionsTable from "./components/PermissionsTable";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function RolesFeature() {
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
          Roles y Permisos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los grupos de seguridad, roles del sistema y revisa los permisos asignados a cada módulo.
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
            aria-label="tabs para roles y permisos"
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                bgcolor: "primary.main",
              },
            }}
          >
            <Tab
              icon={<ShieldRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Roles"
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
              icon={<KeyRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Permisos"
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
          <RolesTable />
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={1}>
          <PermissionsTable />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
