"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { autoLogin, getUserData, refreshToken } from "./api";
import { useAppDispatch } from "./hooks";
import { setUser, setUserId, logoutUser, setHydrated } from "./userSlice";
import type { User } from "./models/user_model";

type ApiEnvelope<T> = { data: T };

function unwrapUser(u: ApiEnvelope<User> | User | undefined | null): User | null {
  if (!u) return null;
  return (u as ApiEnvelope<User>).data ? (u as ApiEnvelope<User>).data : (u as User);
}

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  // Start in "loading"
  useEffect(() => {
    dispatch(setHydrated(false));
  }, [dispatch]);

  const auto_login = useQuery({
    queryKey: ["auto_login"],
    queryFn: autoLogin,
    refetchOnMount: "always",
    retry: 1,
  });

  const refresh_token = useQuery({
    queryKey: ["refresh_token"],
    queryFn: refreshToken,
    enabled: auto_login.isError,
    retry: false,
  });

  useEffect(() => {
    if (refresh_token.isSuccess) {
      qc.invalidateQueries({ queryKey: ["auto_login"] });
    }
  }, [refresh_token.isSuccess, qc]);

  const uid = auto_login.data?.user_id || "";

  const user_query = useQuery({
    queryKey: uid ? ["user", uid] : ["user", "none"],
    queryFn: () => getUserData(uid), // returns { data: User }
    enabled: !!uid,
  });

  useEffect(() => {
    if (user_query.isSuccess && user_query.data && uid) {
      const normalized = unwrapUser(user_query.data);
      if (normalized) {
        dispatch(setUserId(uid));
        dispatch(setUser(normalized)); // setUser(User) updates hasHydrated = true
      } else {
        // If for some reason we couldn't unwrap, at least stop hydrating
        dispatch(logoutUser());
        dispatch(setHydrated(true));
      }
    }
  }, [user_query.isSuccess, user_query.data, uid, dispatch]);

  // If we end up with no uid and both token attempts are done, mark hydrated + logged out
  useEffect(() => {
    const tokensDone = auto_login.isSuccess || auto_login.isError;
    const refreshDone =
      !auto_login.isError || refresh_token.isSuccess || refresh_token.isError;

    if (tokensDone && refreshDone && !uid && !user_query.isLoading) {
      dispatch(logoutUser());
      dispatch(setHydrated(true));
    }
  }, [
    auto_login.isSuccess,
    auto_login.isError,
    refresh_token.isSuccess,
    refresh_token.isError,
    uid,
    user_query.isLoading,
    dispatch,
  ]);

  return null;
}