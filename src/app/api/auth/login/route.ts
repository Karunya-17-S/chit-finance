import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login — called AFTER Firebase has already verified the
 * password client-side. This just resolves the matching app user (role,
 * branch, status) from Postgres by email so the UI knows what to show.
 *
 * NOTE: this trusts the email the client sends. That's acceptable for the
 * "simple approach" phase because a wrong/forged email still can't get past
 * Firebase's own password check to reach this point in a meaningful way,
 * but once deployed we should upgrade this to verify the Firebase ID token
 * server-side (Admin SDK) instead of trusting the posted email directly.
 */
export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

    if (!email) {
        return Response.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
        return Response.json({ error: "No matching app account found for this email." }, { status: 404 });
    }

    if (user.status !== "active") {
        return Response.json({ error: "This account is inactive. Contact your admin." }, { status: 403 });
    }

    return Response.json({ user });
}