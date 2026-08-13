import DashboardLayout from "@/shared/components/dashboard-layout/DashboardLayout";
import { cookies } from "next/headers";

export default async function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("auth_user")?.value;
    let permissions: string[] = [];

    if (userCookie) {
        try {
            const user = JSON.parse(decodeURIComponent(userCookie));
            permissions = user.permissions || [];
        } catch (e) {
            console.error("Error parsing auth_user cookie:", e);
        }
    }

    return (
        <DashboardLayout userPermissions={permissions}>
            {children}
        </DashboardLayout>
    )
}
