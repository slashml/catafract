import { CustomerPortal } from "@polar-sh/nextjs";
import { getServerSession } from "next-auth";
import { getUser } from "@/lib/azure";
import { NextRequest } from "next/server";

export const GET = CustomerPortal({
    accessToken: process.env.POLAR_ACCESS_TOKEN as string,
    getCustomerId: async (req: NextRequest) => {
        const session = await getServerSession();
        if (!session?.user?.email) return "";

        const user = await getUser(session.user.email);
        return (user?.polarCustomerId as string) || "";
    },
    returnUrl: process.env.NEXTAUTH_URL,
    server: "production",
});
