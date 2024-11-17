import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = [];

export const fetchChatNotifications = createAsyncThunk( //createAsyncThunk เพื่อสร้าง action
  "chatnotification/fetch", // ชื่อ action type
  async (_, { rejectWithValue }) => { // _ ไม่มีพารามิเตอร์ในคำขอ rejectWithValue ใช้สำหรับส่งข้อความเมื่อเกิดข้อผิดพลาด
    try {
      const response = await axios.get("http://localhost:4452/getchatnotification");
      return response.data;
    } catch (error) {
      return rejectWithValue("ไม่สามารถดึงข้อมูลการแจ้งเตือนได้");
    }
  }
);

export const removeChatNotification = createAsyncThunk(
  "chatnotification/remove",
  async (from, { rejectWithValue }) => { //from ผู้ป่วยที่ต้องการลบการแจ้งเตือน
    try {
      await axios.post("http://localhost:4452/removechatnotification", { from });
      return from; 
    } catch (error) {
      return rejectWithValue("ไม่สามารถลบการแจ้งเตือนได้");
    }
  }
);

const chatnotificationSlice = createSlice({
  name: "chatnotification",
  initialState,
  reducers: {},
  extraReducers: (builder) => { //ใช้จัดการ action ที่สร้างจาก createAsyncThunk
    builder
      .addCase(fetchChatNotifications.fulfilled, (state, action) => action.payload) //มื่อคำขอสำเร็จ (fulfilled): อัปเดต state ด้วยข้อมูลจาก action.payload
      .addCase(removeChatNotification.fulfilled, (state, action) => state.filter((notification) => notification.from !== action.payload)); //เมื่อคำขอลบสำเร็จ (fulfilled): กรอง state โดยลบรายการที่มี from ตรงกับ action.payload
  },
});

export default chatnotificationSlice.reducer;
