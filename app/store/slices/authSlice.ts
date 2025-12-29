import { AuthUser, Role } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

const initialState: AuthState = {
  user: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
