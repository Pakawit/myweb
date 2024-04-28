import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser: (state, action) => {
      return action.payload;
    },
    deleteUser: (state, action) => {
      return null;
    },
  },
});

export const { setUser, deleteUser } = userSlice.actions;

export default userSlice.reducer;
