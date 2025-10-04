import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppContext } from "../context/appContext";

const initialState = {};

export const personalnotificationSlice = createSlice({
  name: "personalnotification",
  initialState,
  reducers: {
    setPersonalData(state, action) {
      return { ...action.payload };
    },
    clearPersonalData: () => ({}),
  },
});

export const loadPersonalnotificationData = () => async (dispatch) => {
  try {
    dispatch(clearPersonalData());
    const { API_BASE_URL } = AppContext._currentValue; 
    const res = await axios.get(`${API_BASE_URL}/personal/pending`);
    dispatch(setPersonalData(res.data)); 
  } catch (error) {
    console.error("ไม่สามารถโหลดแจ้งเตือนการแก้ไขข้อมูลส่วนตัวได้", error);
  }
};

export const { setPersonalData, clearPersonalData } = personalnotificationSlice.actions;
export default personalnotificationSlice.reducer;