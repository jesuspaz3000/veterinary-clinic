import GroomingFeature from "@/features/grooming";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Grooming & Peluquería | Sistema Veterinario",
    description: "Gestión de personal de peluquería y estilistas caninos",
};

export default function GroomingPage() {
    return <GroomingFeature />;
}
