import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลผู้ใช้ (users) จาก JSON ไฟล์โดยใช้ Dynamic Import
export const fetchUsersThunk = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      // ใช้ Dynamic Import ในการนำเข้าข้อมูลจาก users.json
      const usersData = await import('../json/users.json');
      return usersData.default; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue("Failed to fetch users");
    }
  }
);

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    deleteUsers: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        return action.payload; // อัพเดตสถานะด้วยข้อมูลที่ดึงมา
      })
      .addCase(fetchUsersThunk.rejected, () => {
        console.error("Failed to fetch users");
      });
  },
});

export const { deleteUsers } = usersSlice.actions;

export default usersSlice.reducer;