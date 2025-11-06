'use client';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { login } from '../api';
import { loginUser, setUser } from '../userSlice';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useAppDispatch, useAppSelector } from '../hooks';
import { signIn, useSession } from 'next-auth/react';

/*
  NOTE:

  This file has two auth sections:
  1) Email & Password
  2) OAuth (Google)
  Any user-state changes are mirrored for both flows.
*/

// Simple inline spinner
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function AuthenticationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(true);

  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');

  // flag to avoid redirect loop when classic login just happened
  const [sysLogin, setSysLogin] = useState<boolean>(false);

  // visual pending state for OAuth upsert / redirect window
  const [oauthPending, setOauthPending] = useState<boolean>(false);

  const { data: session, status } = useSession();
  const isLoggedIn = useAppSelector((state) => state.users.isLoggedIn);

  const handleEmailInput = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordInput = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  // --- Email/Password login mutation with loading state from React Query ---
  const login_user = useMutation({
    mutationKey: ['login_user'],
    mutationFn: async () => login({ email, password }),
    onSuccess: (data) => {
      setIsValidEmail(true);
      setIsValidPassword(true);
      dispatch(loginUser());
      setSysLogin(true);
      dispatch(setUser(data.data));
      router.push('/');
    },
    onError: (error: AxiosError) => {
      // fall through; handled below in effect for field flags
      console.error(error);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login_user.isPending || oauthPending) return; // prevent double submits
    login_user.mutate();
  };

  // Reflect field errors from server
  useEffect(() => {
    if (!login_user.isError) return;
    const code = (login_user.error as AxiosError | undefined)?.response?.status;
    if (code === 404) {
      setIsValidEmail(false);
    } else if (code === 401) {
      setIsValidEmail(true);
      setIsValidPassword(false);
    } else {
      // generic failure -> show both as valid (avoid red underlines) but keep console error
      setIsValidEmail(true);
      setIsValidPassword(true);
    }
  }, [login_user.isError, login_user.error]);

  // OAuth: once next-auth session exists, upsert user in backend, then route
  useEffect(() => {
    const run = async () => {
      if (status !== 'authenticated' || !session?.user || isLoggedIn) return;

      try {
        setOauthPending(true);
        let url: string = process.env.NEXT_PUBLIC_BASE_API_LOCAL!;
        if (process.env.NEXT_NODE_ENV === 'prod') {
          url = process.env.NEXT_PUBLIC_BASE_API_PROD!;
        } else if (process.env.NEXT_NODE_ENV === 'dev') {
          url = process.env.NEXT_PUBLIC_BASE_API_DEV!;
        }

        const response = await axios.post(
          `${url}/auth/oauth/upsert`,
          {
            input: {
              provider: (session.user)?.provider,
              providerAccountId: (session.user)?.providerAccountId,
              email: session.user?.email,
              name: session.user?.name,
              image: session.user?.image,
            },
          },
          { withCredentials: true }
        );

        if (response.status !== 200) {
          console.error('OAuth upsert failed:', response.status, response.data);
          setOauthPending(false);
          return;
        }

        if (response.data?.hasProfile) {
          setHasProfile(true);
        }
        dispatch(loginUser());
        setUserId(response.data?.user_id ?? '');
      } catch (err) {
        console.error('OAuth upsert error:', err);
        setOauthPending(false);
      }
    };
    run();
  }, [status, session, isLoggedIn, dispatch]);

  // Redirect after either flow has logged-in state
  useEffect(() => {
    if (!isLoggedIn || sysLogin) return;
    const target = hasProfile ? '/' : `/user_profile/profile_setup?user_id=${encodeURIComponent(userId)}`;
    router.replace(target);
    // after scheduling replace, we can drop the pending spinner
    setOauthPending(false);
  }, [isLoggedIn, hasProfile, sysLogin, userId, router]);

  // Disable all controls while any auth is in-flight
  const busy = login_user.isPending || oauthPending;

  return (
    <>
      <div className="flex justify-center items-center min-h-screen px-4">
        <form
          className="h-fit w-full max-w-sm bg-[#242528] rounded-2xl p-4 flex flex-col justify-center"
          aria-busy={busy}
        >
          <h1 className="text-2xl text-white self-center mt-2">Sign in</h1>

          <div className="p-2 flex flex-col gap-3 mt-2">
            <input
              type="email"
              onChange={handleEmailInput}
              className="rounded-xl bg-[#161719] w-full p-2 disabled:opacity-60"
              placeholder="Enter Your Email"
              disabled={busy}
              autoComplete="email"
            />
            <span className={isValidEmail ? 'hidden' : ''}>
              <p className="text-red-600">Email does not exist</p>
            </span>

            <input
              type="password"
              onChange={handlePasswordInput}
              className="rounded-xl bg-[#161719] w-full p-2 disabled:opacity-60"
              placeholder="Enter Your Password"
              disabled={busy}
              autoComplete="current-password"
            />
            <span className={isValidPassword ? 'hidden' : ''}>
              <p className="text-red-600">Incorrect Password</p>
            </span>

            <Link href="/auth/forgot_pwd">
              <p className="ml-1 text-[0.9rem] hover:underline cursor-pointer w-fit">Forgot Password ?</p>
            </Link>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleLogin}
                disabled={busy}
                className={[
                  'w-full rounded-xl border p-2 cursor-pointer',
                  'transition-transform duration-150 ease-out',
                  'hover:bg-green-500 hover:text-white',
                  'active:scale-95 active:bg-green-600 active:text-white',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60',
                  'select-none disabled:opacity-60 disabled:cursor-not-allowed',
                ].join(' ')}
              >
                {login_user.isPending ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Spinner />
                    Signing in…
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              <Link className="w-full" href="/auth/register" aria-disabled={busy} tabIndex={busy ? -1 : 0}>
                <button
                  type="button"
                  disabled={busy}
                  className={[
                    'w-full rounded-xl border p-2 cursor-pointer',
                    'transition-transform duration-150 ease-out',
                    'hover:bg-blue-500 hover:text-white',
                    'active:scale-95 active:bg-blue-600 active:text-white',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                    'select-none disabled:opacity-60 disabled:cursor-not-allowed',
                  ].join(' ')}
                >
                  Register
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-sm text-gray-500">or</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (busy) return;
                  setOauthPending(true);
                  // next-auth will take over; we keep spinner until session->upsert flow ends
                  signIn('google');
                }}
                disabled={busy}
                className={[
                  'flex w-full items-center bg-blue-600 cursor-pointer rounded-xl',
                  'transition-transform duration-150 ease-out hover:border',
                  'active:scale-95 active:brightness-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70',
                  'select-none disabled:opacity-60 disabled:cursor-not-allowed',
                ].join(' ')}
              >
                <Image className="bg-white" src="/google-symbol.png" width={40} height={40} alt="Google Logo" />
                <p className="w-full self-center text-white flex items-center justify-center gap-2">
                  {oauthPending ? (
                    <>
                      <Spinner />
                      Connecting to Google…
                    </>
                  ) : (
                    'Sign in With Google'
                  )}
                </p>
              </button>
              {/* <button className="flex w/full items-center bg-[#5968F0] ...">Discord</button> */}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default AuthenticationPage;
