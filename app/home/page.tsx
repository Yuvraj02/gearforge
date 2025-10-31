'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Carousel from "./Carousel";
import HighestRated from "./sections/HighestRated";
import Popular from "./sections/Popular";
import { autoLogin, getUserData, refreshToken } from "../api";
import { useAppDispatch } from "../hooks";
import { setUser, setUserId } from "../userSlice";
import { useEffect } from "react";

function HomePage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const auto_login = useQuery({
    queryKey: ['auto_login'],
    queryFn: autoLogin,
    refetchOnMount: "always",
    retry: 1,
  });

  const refresh_token = useQuery({
    queryKey: ['refresh_token'],
    queryFn: refreshToken,
    enabled: auto_login.isError,
    retry: false,
  });

  useEffect(() => {
    if (refresh_token.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['auto_login'] });
    }
  }, [refresh_token.isSuccess, queryClient]);

  const user_query = useQuery({
    queryKey: [`user_${auto_login.data?.user_id}`],
    queryFn: () => getUserData(auto_login.data.user_id),
    enabled: !!auto_login.data?.user_id,
  });

  useEffect(() => {
    if (user_query.isSuccess && user_query.data && auto_login.data?.user_id) {
      dispatch(setUserId(auto_login.data.user_id));
      dispatch(setUser(user_query.data));
    }
  }, [user_query.isSuccess, user_query.data, auto_login.data?.user_id, dispatch]);

  return (
    <main className="flex min-h-screen w-full">
      <div className="flex flex-col w-full min-h-screen">
        <Carousel />
        <Popular />
      </div>
    </main>
  )
}

export default HomePage;
