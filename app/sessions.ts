import { createCookieSessionStorage } from "react-router"; // React Router 7

type SessionData = {
    authToken: string;
    activeOrderError?: any;
};

type SessionFlashData = {
    error: string;
    activeOrderError: any;
};

export const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData, SessionFlashData>({
        cookie: {
            name: "vendure_session",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
            sameSite: "lax",
            secrets: ["s3cret1"], // TODO: Move to env variable
            secure: process.env.NODE_ENV === "production",
        },
    });
