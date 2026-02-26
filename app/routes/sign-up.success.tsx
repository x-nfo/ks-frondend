import { Link, useSearchParams } from "react-router";

import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function SignUpSuccessPage() {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold font-serif text-karima-brand">
          Create Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-karima-brand/10 backdrop-blur-sm">
          <div className="rounded-md bg-green-50/50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon
                  className="h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Registration Successful
                </h3>
                <div className="mt-2 text-sm text-green-700 font-bold">
                  <p>Please check your email to verify your account.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/sign-in"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-karima-brand hover:bg-karima-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karima-brand"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
