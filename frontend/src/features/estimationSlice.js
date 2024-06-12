import { createSlice } from "@reduxjs/toolkit";
import Data from '../json/estimations.json'

const initialState = Data;

export const estimationSlice = createSlice({
  name: "estimation",
  initialState,
  reducers: {
    setEstimation: () => {
      return initialState;
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
