"use client";

import { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import AppointmentsAgenda from "./components/AppointmentsAgenda";
import AppointmentsTable from "./components/AppointmentsTable";

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
      id={`appointments-tabpanel-${index}`}
      aria-labelledby={`appointments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `appointments-tab-${index}`,
    "aria-controls": `appointments-tabpanel-${index}`,
  };
}

export default function AppointmentsFeature() {
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
          Citas y Agenda
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Agenda semanal de citas médicas con asignación de veterinario, control de solapamientos
          de horario y seguimiento por estado (pendiente, confirmada, completada, cancelada).
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
            aria-label="tabs para agenda y lista de citas"
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                bgcolor: "primary.main",
              },
            }}
          >
            <Tab
              icon={<CalendarMonthRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Agenda Semanal"
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
              icon={<ViewListRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Lista de Citas"
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
          <AppointmentsAgenda />
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={1}>
          <AppointmentsTable />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
