import { createSlice } from "@reduxjs/toolkit";

export const medicationSlice = createSlice({
  name: "medication",
  initialState: null,
  reducers: {
    setMedication: (state, action) => {
      return action.payload;
    },
    addMedication: (state, action) => {
      state.push(action.payload);
    },
    deleteMedication: (state, action) => {
      return null;
    },
  },
});

export const { setMedication, addMedication, deleteMedication } = medicationSlice.actions;

export default medicationSlice.reducer;
