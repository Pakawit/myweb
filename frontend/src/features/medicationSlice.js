import { createSlice } from "@reduxjs/toolkit";
import Data from '../json/medications.json'

export const medicationSlice = createSlice({
  name: "medication",
  initialState: Data,  
  reducers: {
    setMedication: (state, action) => {
      return action.payload;
    },
    addMedication: (state, action) => {
      state.push(action.payload);
    },
    deleteMedication: () => {
      return null;
    },
  },
});


export const { setMedication, addMedication, deleteMedication } = medicationSlice.actions;

export default medicationSlice.reducer;
