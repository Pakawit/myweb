import { createSlice } from "@reduxjs/toolkit";
import personalData from "../json/personal.json"; 

const initialState = {};

export const personalnotificationSlice = createSlice({
  name: "personal",
  initialState,
  reducers: {
    setPersonalData(state, action) {
      return { ...state, ...action.payload }; 
    },
    clearPersonalData: () => {
      return {}; 
    }
  },
});

export const loadPersonalnotificationData = () => async (dispatch) => {
  try {
    dispatch(clearPersonalData());  
    const data = personalData;  
    dispatch(setPersonalData(data)); 
  } catch (error) {
    console.error("ไม่สามารถโหลดแจ้งเตือนการแก้ไขข้อมูลส่วนตัวได้", error);
  }
};

export const { setPersonalData, clearPersonalData } = personalnotificationSlice.actions;

export default personalnotificationSlice.reducer;