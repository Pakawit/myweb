import { createSlice } from "@reduxjs/toolkit";
import medicationsData from "../json/medications.json"; 

const initialState = [];

export const medicationSlice = createSlice({
  name: "medication",
  initialState,
  reducers: {
    setMedications(state, action) {
      return [...action.payload];  // อัปเดต state ด้วยข้อมูลที่ส่งมาจาก action.payload
    },
    deleteMedication: () => {
      return []; 
    },
  },
});


export const loadMedicationsData = () => async (dispatch) => {
  try {
  
    const data = medicationsData; 
    dispatch(setMedications(data)); 
  } catch (error) {
    console.error("ไม่สามารถโหลดข้อมูลยาได้", error);
  }
};

export const { setMedications, deleteMedication } = medicationSlice.actions;

export default medicationSlice.reducer;