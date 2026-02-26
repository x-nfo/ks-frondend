import type { Route } from "./+types/sign-in";
import {
  data,
  redirect,
  useFetcher,
  useSearchParams,
  Link,
} from "react-router";
import { login } from "../providers/account/account";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "~/components/Button";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Input } from "~/components/Input";

export function meta() {
  return [{ title: "Masuk - Karima Syari" }];
}

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  rememberMe: z.boolean().optional(),
  redirectTo: z.string().optional(),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });

  if (submission.status !== "success") {
    return data(submission.reply(), { status: 400 });
  }

  const {
    email,
    password,
    rememberMe,
    redirectTo = "/account",
  } = submission.value;

  try {
    const result = await login({ email, password, rememberMe }, { request });
    if (result.__typename === "CurrentUser") {
      return redirect(redirectTo, { headers: result._headers });
    } else {
      return data(submission.reply({ formErrors: [result.message] }), {
        status: 401,
      });
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return data(
      submission.reply({ formErrors: ["An unexpected error occurred."] }),
      { status: 500 },
    );
  }
}

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const loginFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "login-form",
    lastResult: loginFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <>
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl text-karima-brand font-bold font-serif">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-karima-ink/70">
            Or{" "}
            <Link
              to="/sign-up"
              className="font-medium text-karima-accent hover:text-karima-brand transition-colors"
            >
              Register
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-karima-brand/10 backdrop-blur-sm">
            <div className="bg-karima-gold/10 border border-karima-gold/20 text-karima-brand rounded p-4 text-center text-sm mb-6 font-medium">
              <p> Sign in to access your account </p>
            </div>
            <loginFetcher.Form method="post" {...getFormProps(form)}>
              <fieldset
                disabled={loginFetcher.state !== "idle"}
                className="space-y-6"
              >
                <input
                  type="hidden"
                  name="redirectTo"
                  value={searchParams.get("redirectTo") ?? undefined}
                />
                <div>
                  <Input
                    {...getInputProps(fields.email, { type: "email" })}
                    label="Email Address"
                    placeholder="Email Address"
                    autoComplete="email"
                    required
                    error={fields.email.errors?.join(", ")}
                  />
                </div>

                <div>
                  <Input
                    {...getInputProps(fields.password, { type: "password" })}
                    label="Password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    error={fields.password.errors?.join(", ")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...getInputProps(fields.rememberMe, {
                        type: "checkbox",
                      })}
                      className="h-4 w-4 text-karima-brand focus:ring-karima-brand border-gray-300 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor={fields.rememberMe.id}
                      className="ml-2 block text-sm text-karima-ink"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-karima-accent hover:text-karima-brand transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {form.errors && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircleIcon
                          className="h-5 w-5 text-red-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Sign in error
                        </h3>
                        <p className="text-sm text-red-700 mt-2">
                          {form.errors.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-karima-brand hover:bg-karima-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karima-brand"
                  >
                    <span className="flex gap-4 items-center">
                      {loginFetcher.state !== "idle" && (
                        <ArrowPathIcon className="animate-spin h-5 w-5 text-gray-500" />
                      )}
                      Sign In
                    </span>
                  </Button>
                </div>
              </fieldset>
            </loginFetcher.Form>
          </div>
        </div>
      </div>
    </>
  );
}
