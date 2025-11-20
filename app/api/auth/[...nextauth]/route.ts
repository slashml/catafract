import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (user.email) {
                const { getUser, updateUser } = await import("@/lib/azure");
                const existingUser = await getUser(user.email);

                if (!existingUser) {
                    await updateUser(user.id, {
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        createdAt: new Date().toISOString(),
                    });
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/', // Redirect to home for sign-in
    },
})

export { handler as GET, handler as POST }
