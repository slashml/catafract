import { Webhooks } from "@polar-sh/nextjs";
import { updateUser } from "@/lib/azure";

const polarWebhookSecret =
    process.env.NEXT_PUBLIC_SETUP === "local" ?
        process.env.POLAR_SANDBOX_WEBHOOK_SECRET! :
        process.env.POLAR_WEBHOOK_SECRET!;

export const POST = Webhooks({
    webhookSecret: polarWebhookSecret,
    onSubscriptionActive: async (payload: any) => {
        console.log("Subscription active:", payload);
        const payloadData = payload.data;
        const userId = payloadData?.customer?.externalId;

        if (userId) {
            await updateUser(userId, {
                isPro: true,
                polarCustomerId: payloadData.customer?.id,
                subscriptionStatus: payloadData.status
            });
        }
    },
    onSubscriptionCanceled: async (payload: any) => {
        console.log("Subscription won't renew:", payload);
        const userId = payload.data?.customer?.externalId;

        if (userId) {
            await updateUser(userId, {
                subscriptionStatus: 'wont-renew'
            });
        }
    },
    onSubscriptionRevoked: async (payload: any) => {
        console.log("Subscription revoked:", payload);
        const userId = payload.data?.customer?.externalId;

        if (userId) {
            await updateUser(userId, {
                isPro: false,
                subscriptionStatus: 'revoked'
            });
        }
    }
});
