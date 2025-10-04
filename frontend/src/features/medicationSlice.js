// src/features/medicationSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../config";          

const initialState = [];               

export const medicationSlice = createSlice({
  name: "medication",
  initialState,
  reducers: {
    setMedications: (_state, action) => [...action.payload], 
    deleteMedication: () => [],                             
  },
});

export const loadMedicationsData = () => async (dispatch) => {
  try {
    const res = await axios.get(`${config.API_BASE_URL}/getmedication`);
    dispatch(setMedications(res.data || []));
  } catch (error) {
    console.error("❌ ไม่สามารถโหลดข้อมูลยาได้:", error);
  }
};

export const { setMedications, deleteMedication } = medicationSlice.actions;
export default medicationSlice.reducer;