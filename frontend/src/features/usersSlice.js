import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลผู้ใช้ (users) จาก JSON ไฟล์
export const fetchUsersThunk = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:5001/json/users.json");
      return response.data; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue(error.response.data);
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
