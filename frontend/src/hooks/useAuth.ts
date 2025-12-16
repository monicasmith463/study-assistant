"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  type Body_login_login_access_token as AccessToken,
  type ApiError,
  LoginService,
  type UserPublic,
  type UserRegister,
  UsersService,
} from "@/client";
import { handleError } from "@/utils";


const useIsLoggedIn = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setLoggedIn(token !== null);
  }, []);

  return loggedIn;
};

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const isLoggedIn = useIsLoggedIn();

  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn,
  });

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      router.push("/signin");
    },
    onError: (err: ApiError) => {
      handleError(err);
      setError(err.message || "Signup failed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const login = async (data: AccessToken) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    });
    localStorage.setItem("access_token", response.access_token);
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      router.push("/");
    },
    onError: (err: ApiError) => {
      handleError(err);
      setError(err.message || "Login failed");
    },
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    router.push("/signin");
  };

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    error,
    resetError: () => setError(null),
  };
};

export { useIsLoggedIn };
export default useAuth;
