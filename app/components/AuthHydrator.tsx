"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/store/slices/authSlice";
import { AuthUser } from "../types";

export default function AuthHydrator({ user }: { user: AuthUser }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUser(user));
  }, [user, dispatch]);

  return null;
}
