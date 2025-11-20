import { Webhooks } from "@polar-sh/nextjs";
import { updateUser } from "@/lib/azure";

export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onSubscriptionCreated: async (payload: any) => {
        console.log("Subscription created:", payload);

        const payloadData = payload.data;
        const userId = payloadData?.customer?.externalId;

        if (userId) {
            await updateUser(userId, {
                isPro: true,
                productId: payloadData.product?.id,
                subscriptionStatus: payloadData.status
            });
        }
    },
    onSubscriptionActive: async (payload: any) => {
        console.log("Subscription active:", payload);
        const payloadData = payload.data;
        const userId = payloadData?.customer?.externalId;

        if (userId) {
            await updateUser(userId, {
                isPro: true,
                productId: payloadData.product?.id,
                subscriptionStatus: payloadData.status
            });
        }
    },
    onSubscriptionCanceled: async (payload: any) => {
        console.log("Subscription canceled:", payload);
        const userId = payload.data?.customer?.externalId;

        if (userId) {
            await updateUser(userId, {
                isPro: false,
                subscriptionStatus: 'canceled'
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
