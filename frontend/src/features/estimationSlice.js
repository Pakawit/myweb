import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลการประเมิน (estimation) จาก JSON ไฟล์
export const fetchEstimationsThunk = createAsyncThunk(
  "estimation/fetchEstimations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:4451/json/estimations.json");
      return response.data; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const estimationSlice = createSlice({
  name: "estimation",
  initialState,
  reducers: {
    addEstimation: (state, action) => {
      state.push(action.payload);
    },
    deleteEstimation: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstimationsThunk.fulfilled, (state, action) => {
        return action.payload; // อัพเดตสถานะด้วยข้อมูลที่ดึงมา
      })
      .addCase(fetchEstimationsThunk.rejected, () => {
        console.error("Failed to fetch estimations");
      });
  },
});

export const { addEstimation, deleteEstimation } = estimationSlice.actions;

export default estimationSlice.reducer;
