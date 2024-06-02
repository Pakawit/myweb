import { createSlice } from "@reduxjs/toolkit";

export const selectuserSlice = createSlice({
  name: "setselectuser",
  initialState: null,
  reducers: {
    setselectuser: (state, action) => {
      return action.payload;
    },
    deleteselectuser: (state, action) => {
      return null;
    },
  },
});

export const { setselectuser, deleteselectuser } = selectuserSlice.actions;

export default selectuserSlice.reducer;
