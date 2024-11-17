import { createSlice } from "@reduxjs/toolkit";
import notificationsData from "../json/hfsnotification.json"; 

const initialState = [];

export const hfsnotificationSlice = createSlice({
  name: "hfsnotification",
  initialState,
  reducers: {
    setHfsNotifications(state, action) {
      return [...action.payload];  
    },
    clearNotifications: () => {
      return [];
    },
  },
});

export const loadHFSNotifications = () => async (dispatch) => {
  try {
    const data = notificationsData; 
    dispatch(setHfsNotifications(data)); 
  } catch (error) {
    console.error("ไม่สามารถโหลดข้อมูลการแจ้งเตือน HFS ได้", error);
  }
};

export const { setHfsNotifications, clearNotifications } = hfsnotificationSlice.actions;

export default hfsnotificationSlice.reducer;