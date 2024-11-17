import { createSlice } from "@reduxjs/toolkit";
import estimationHFSData from "../json/estimationHFS.json"; 

const initialState = {};

export const estimationHFSSlice = createSlice({
  name: "estimationHFS",
  initialState,
  reducers: {
    setEstimationHFS(state, action) {
      return {...action.payload}; // อัปเดต state ด้วยค่าที่ได้รับจาก action.payload
    },
    clearEstimationHFS: () => {
      return {};
    }
  },
});

export const loadEstimationHFSData = () => async (dispatch) => {
  try {
    dispatch(clearEstimationHFS());
    const data = estimationHFSData; 
    dispatch(setEstimationHFS(data));
  } catch (error) {
    console.error("ไม่สามารถโหลดแจ้งเตือนการประเมิน HFS ระหว่าง admin ได้", error);
  }
};

export const { setEstimationHFS, clearEstimationHFS } = estimationHFSSlice.actions;

export default estimationHFSSlice.reducer;