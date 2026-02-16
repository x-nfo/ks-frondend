import { data, redirect } from "react-router";

// Shim for Remix's json helper which is not exported by react-router v7 core
export const json = (data: any, init?: ResponseInit) => {
    return Response.json(data, init);
};

export { redirect };
export type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
