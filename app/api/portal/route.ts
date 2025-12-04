import { CustomerPortal } from "@polar-sh/nextjs";
import { getServerSession } from "next-auth";
import { getUser } from "@/lib/azure";
import { NextRequest } from "next/server";

const isLocal = process.env.NEXT_PUBLIC_SETUP === "local";
const polarToken = isLocal ? process.env.POLAR_SANDBOX_ACCESS_TOKEN! : process.env.POLAR_ACCESS_TOKEN!;
const polarServer = isLocal ? "sandbox" : "production";

export const GET = CustomerPortal({
    accessToken: polarToken,
    getCustomerId: async (req: NextRequest) => {
        const session = await getServerSession();
        if (!session?.user?.email) return "";

        const user = await getUser(session.user.email);
        return (user?.polarCustomerId as string) || "";
    },
    returnUrl: process.env.POLAR_RETURN_URL,
    server: polarServer,
});
