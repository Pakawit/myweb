import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchChatNotifications = createAsyncThunk(
  "chatnotification/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:4452/getchatnotification");
      return response.data; // data จะเป็น object
    } catch (error) {
      return rejectWithValue("ไม่สามารถดึงข้อมูลการแจ้งเตือนได้");
    }
  }
);

export const removeChatNotification = createAsyncThunk(
  "chatnotification/remove",
  async (from, { rejectWithValue }) => {
    try {
      await axios.post("http://localhost:4452/removechatnotification", { from });
      return from; // ส่งคืน key ที่ถูกลบ
    } catch (error) {
      return rejectWithValue("ไม่สามารถลบการแจ้งเตือนได้");
    }
  }
);

const chatnotificationSlice = createSlice({
  name: "chatnotification",
  initialState: {}, // เปลี่ยน state เริ่มต้นเป็น object
  reducers: {
    clearChatNotifications: (state) => {
      return {}; // ล้างข้อมูลการแจ้งเตือน
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatNotifications.fulfilled, (state, action) => {
        return action.payload; // ใช้ข้อมูล object ทั้งหมดจาก payload
      })
      .addCase(removeChatNotification.fulfilled, (state, action) => {
        delete state[action.payload]; // ลบ key ที่ตรงกับ action.payload
      });
  },
});

export const { clearChatNotifications } = chatnotificationSlice.actions;
export default chatnotificationSlice.reducer;

