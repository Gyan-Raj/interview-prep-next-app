"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/store/slices/authSlice";

export default function AuthHydrator({ user }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUser(user));
  }, [user, dispatch]);

  return null;
}
