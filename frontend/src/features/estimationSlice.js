import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลการประเมิน (estimation) จาก JSON ไฟล์โดยใช้ Dynamic Import
export const fetchEstimationsThunk = createAsyncThunk(
  "estimation/fetchEstimations",
  async (_, { rejectWithValue }) => {
    try {
      // ใช้ Dynamic Import ในการนำเข้าข้อมูลจาก estimations.json
      const estimationsData = await import('../json/estimations.json');
      return estimationsData.default; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue("Failed to fetch estimations");
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