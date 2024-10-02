import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูล personal จาก JSON ไฟล์ที่ใช้ Dynamic Import
export const fetchPersonalDataThunk = createAsyncThunk(
  "personal/fetchPersonalData",
  async (_, { rejectWithValue }) => {
    try {
      // ดึงข้อมูลจากไฟล์ personal.json
      const personalData = await import('../json/personal.json');
      return personalData.default; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue("Failed to fetch personal data");
    }
  }
);

export const personalSlice = createSlice({
  name: "personal",
  initialState,
  reducers: {
    addPersonal: (state, action) => {
      state.push(action.payload); // เพิ่มข้อมูลใหม่
    },
    deletePersonal: () => {
      return []; // ลบข้อมูลทั้งหมด
    },
    updatePersonal: (state, action) => {
      return state.map(person =>
        person._id === action.payload._id ? action.payload : person
      ); // อัพเดตข้อมูลที่มีอยู่
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonalDataThunk.fulfilled, (state, action) => {
        return action.payload; // อัพเดตสถานะด้วยข้อมูลที่ดึงมา
      })
      .addCase(fetchPersonalDataThunk.rejected, () => {
        console.error("Failed to fetch personal data");
      });
  },
});

export const { addPersonal, deletePersonal, updatePersonal } = personalSlice.actions;

export default personalSlice.reducer;