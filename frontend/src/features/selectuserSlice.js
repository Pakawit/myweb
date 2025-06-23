import { createSlice } from "@reduxjs/toolkit";

export const selectuserSlice = createSlice({
  name: "selectuser",
  initialState: {},
  reducers: {
    setselectuser: (state, action) => {
      return { ...state, ...action.payload }
    },
    deleteselectuser: () => {
      return {};
    },
  },
});

export const { setselectuser, deleteselectuser } = selectuserSlice.actions;

export default selectuserSlice.reducer;