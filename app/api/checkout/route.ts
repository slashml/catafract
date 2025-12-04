import { Checkout } from "@polar-sh/nextjs";

const isLocal = process.env.NEXT_PUBLIC_SETUP === "local";
const polarToken = isLocal ? process.env.POLAR_SANDBOX_ACCESS_TOKEN! : process.env.POLAR_ACCESS_TOKEN!;
const polarServer = isLocal ? "sandbox" : "production";

export const GET = Checkout({
    accessToken: polarToken,
    successUrl: process.env.POLAR_SUCCESS_URL,
    returnUrl: process.env.POLAR_RETURN_URL,
    server: polarServer,
    theme: "light"
});
