import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลยา (medication) จาก JSON ไฟล์
export const fetchMedicationsThunk = createAsyncThunk(
  "medication/fetchMedications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:4452/json/medications.json");
      return response.data; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const medicationSlice = createSlice({
  name: "medication",
  initialState,  
  reducers: {
    addMedication: (state, action) => {
      state.push(action.payload);
    },
    deleteMedication: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicationsThunk.fulfilled, (state, action) => {
        return action.payload; // อัพเดตสถานะด้วยข้อมูลที่ดึงมา
      })
      .addCase(fetchMedicationsThunk.rejected, () => {
        console.error("Failed to fetch medications");
      });
  },
});

export const { addMedication, deleteMedication } = medicationSlice.actions;

export default medicationSlice.reducer;
