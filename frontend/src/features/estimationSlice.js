import { createSlice } from "@reduxjs/toolkit";

export const estimationSlice = createSlice({
  name: "estimation",
  initialState: null,
  reducers: {
    setEstimation: (state, action) => {
      return action.payload;
    },
    addEstimation: (state, action) => {
      state.push(action.payload);
    },
    deleteEstimation: (state, action) => {
      return null;
    },
  },
});

export const { setEstimation, addEstimation, deleteEstimation } = estimationSlice.actions;

export default estimationSlice.reducer;
