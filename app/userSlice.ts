import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./models/user_model";

interface UserState {
  user: User;
  isLoggedIn: boolean;
  hasHydrated: boolean; // if you don't use this, you can remove it
}

const user: User = {
  name: "",
  user_id: "",
  user_name: "",
  email: "",
  division: 3,
  role: "player",
  division_score: 0, // or division_points if that's your canonical field
};

const emptyUser: User = {
  name: "",
  user_id: "",
  user_name: "",
  email: "",
  division: 3,
  current_team: "",
  participated_tournaments: [],
  won_tournaments: [],
  past_teams: [],
  discord_id: "",
  role: "player",
  division_score: 0,
};

const initUserState: UserState = {
  user,
  isLoggedIn: false,
  hasHydrated: false, // set to true if you’re not using an auth bootstrap
};

export const userSlice = createSlice({
  name: "userSlice",
  initialState: initUserState,
  reducers: {
    // ✅ accept a User directly and store it directly
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.hasHydrated = true;
    },

    setUserId: (state, action: PayloadAction<string>) => {
      state.user.user_id = action.payload;
    },

    loginUser: (state) => {
      state.isLoggedIn = true;
    },

    logoutUser: (state) => {
      state.isLoggedIn = false;
      state.user = emptyUser;
      state.hasHydrated = true;
    },

    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hasHydrated = action.payload;
    },
  },
});

export const { setUser, setUserId, loginUser, logoutUser, setHydrated } = userSlice.actions;
export default userSlice.reducer;
