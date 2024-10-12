import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = [];

export const fetchPersonalDataThunk = createAsyncThunk(
  "personal/fetchPersonalData",
  async (_, { rejectWithValue }) => {
    try {
      const personalData = await import('../json/personal.json');
      return personalData.default; 
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
    }
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

export const { addPersonal, deletePersonal } = personalSlice.actions;

export default personalSlice.reducer;