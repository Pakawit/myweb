import { createSlice } from "@reduxjs/toolkit";
import Data from '../json/medications.json'

const initialState = Data;

export const medicationSlice = createSlice({
  name: "medication",
  initialState,  
  reducers: {
    setMedication: () => {
      return initialState;
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
