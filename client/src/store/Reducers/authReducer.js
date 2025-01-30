import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    addUser: (state, action) => {
      (state.user = action.payload), (state.isAuthenticated = true);
    },
    removeUser: (state) => {
      (state.user = null), (state.isAuthenticated = false),(state.isAdmin = false);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addUser, removeUser } = authReducer.actions;

export default authReducer.reducer;