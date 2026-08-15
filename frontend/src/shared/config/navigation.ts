import { ElementType } from "react";
import { Permission, PERMISSIONS } from "./permissions";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import MedicalInformationRoundedIcon from "@mui/icons-material/MedicalInformationRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import PestControlRoundedIcon from "@mui/icons-material/PestControlRounded";
import HealingRoundedIcon from "@mui/icons-material/HealingRounded";
import BedRoundedIcon from "@mui/icons-material/BedRounded";

export interface NavItem {
    label: string;
    href: string;
    icon: ElementType;
    permission?: Permission;
}

export const navItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: DashboardRoundedIcon,
        permission: PERMISSIONS.DASHBOARD.READ,
    },
    {
        label: "Dueños / Clientes",
        href: "/owners",
        icon: PeopleAltRoundedIcon,
        permission: PERMISSIONS.OWNERS.READ,
    },
    {
        label: "Mascotas / Pacientes",
        href: "/pets",
        icon: PetsRoundedIcon,
        permission: PERMISSIONS.PETS.READ,
    },
    {
        label: "Productos e Inventario",
        href: "/products",
        icon: Inventory2RoundedIcon,
        permission: PERMISSIONS.PRODUCTS.READ,
    },
    {
        label: "Ventas y Facturación",
        href: "/sales",
        icon: ReceiptLongRoundedIcon,
        permission: PERMISSIONS.SALES.READ,
    },
    {
        label: "Citas y Agenda",
        href: "/appointments",
        icon: CalendarMonthRoundedIcon,
        permission: PERMISSIONS.APPOINTMENTS.READ,
    },
    {
        label: "Horarios",
        href: "/schedules",
        icon: ScheduleRoundedIcon,
        permission: PERMISSIONS.SCHEDULES.READ,
    },
    {
        label: "Historial Clínico",
        href: "/medical-records",
        icon: MedicalInformationRoundedIcon,
        permission: PERMISSIONS.MEDICAL_RECORDS.READ,
    },
    {
        label: "Vacunación",
        href: "/vaccinations",
        icon: VaccinesRoundedIcon,
        permission: PERMISSIONS.VACCINATIONS.READ,
    },
    {
        label: "Desparasitación",
        href: "/deworming",
        icon: PestControlRoundedIcon,
        permission: PERMISSIONS.DEWORMING.READ,
    },
    {
        label: "Cirugías",
        href: "/surgeries",
        icon: HealingRoundedIcon,
        permission: PERMISSIONS.SURGERIES.READ,
    },
    {
        label: "Hospitalización",
        href: "/hospitalizations",
        icon: BedRoundedIcon,
        permission: PERMISSIONS.HOSPITALIZATION.READ,
    },
    {
        label: "Roles y permisos",
        href: "/roles-permissions",
        icon: ShieldRoundedIcon,
        permission: PERMISSIONS.ROLES.READ,
    },
    {
        label: "Usuarios",
        href: "/users",
        icon: PeopleRoundedIcon,
    },
    {
        label: "Veterinarios",
        href: "/veterinarians",
        icon: MedicalServicesRoundedIcon,
        permission: PERMISSIONS.VETERINARIANS.READ,
    },
    {
        label: "Grooming / Peluquería",
        href: "/grooming",
        icon: ContentCutRoundedIcon,
        permission: PERMISSIONS.GROOMING.READ,
    },
    {
        label: "Personal Administrativo",
        href: "/administrative",
        icon: AdminPanelSettingsRoundedIcon,
        permission: PERMISSIONS.ADMINISTRATIVE.READ,
    },
];