import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลยา (medication) จาก JSON ไฟล์ที่ใช้ Dynamic Import
export const fetchMedicationsThunk = createAsyncThunk(
  "medication/fetchMedications",
  async (_, { rejectWithValue }) => {
    try {
      const medicationsData = await import('../json/medications.json'); // ใช้ Dynamic Import
      return medicationsData.default;
    } catch (error) {
      return rejectWithValue("Failed to fetch medications");
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