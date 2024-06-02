import { createSlice } from "@reduxjs/toolkit";
import Data from '../json/estimations.json'

export const estimationSlice = createSlice({
  name: "estimation",
  initialState: Data,
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
