import { createSlice } from "@reduxjs/toolkit";

export const selectuserSlice = createSlice({
  name: "selectuser",
  initialState: null,
  reducers: {
    setselectuser: (state, action) => {
      return action.payload;
    },
    deleteselectuser: () => {
      return null;
    },
  },
});

export const { setselectuser, deleteselectuser } = selectuserSlice.actions;

export default selectuserSlice.reducer;
