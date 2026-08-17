"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGuestLogin = () => {
    router.push("/tasks");
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[384px] text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-black flex items-center justify-center">
            <span className="text-white text-sm font-semibold">△</span>
          </div>

          <span className="text-[16px] font-semibold text-[#171717]">
            Pyramid
          </span>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-white px-7 py-7 shadow-sm">
          <h1 className="text-[20px] font-semibold leading-7 text-[#171717]">
            Let's get back on track
          </h1>

          <p className="mt-1.5 text-[13px] leading-5 text-[#737373]">
            Enter your email below to login to your account.
          </p>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full rounded-full bg-[#171717] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a] active:scale-[0.99]"
            >
              Continue as Guest
            </button>

            <button
              type="button"
              className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-2.5 text-[13px] font-medium text-[#171717] transition hover:bg-[#F7F7F7]"
            >
              <span className="mr-2 font-bold">G</span>
              Login with Google
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="mx-auto mt-5 max-w-[300px] text-[11px] leading-4 text-[#8A8A8A]">
          By clicking continue, you agree to
          <br />
          our{" "}
          <button className="underline underline-offset-2">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="underline underline-offset-2">
            Privacy Policy
          </button>
        </p>
      </div>
    </main>
  );
}