import { createSlice } from "@reduxjs/toolkit";

export const adminSlice = createSlice({
  name: "admin",
  initialState: null,
  reducers: {
    setAdmin: (state, action) => {
      return action.payload;
    },
    deleteAdmin: () => {
      return null;
    },
  },
});

export const { setAdmin, deleteAdmin } = adminSlice.actions;

export default adminSlice.reducer;
