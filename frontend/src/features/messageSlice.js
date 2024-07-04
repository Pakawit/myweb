import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลข้อความจาก JSON ไฟล์
export const fetchMessagesThunk = createAsyncThunk(
  "message/fetchMessages",
  async (_, { rejectWithValue }) => {
    try {
      // ดึงข้อมูลจากไฟล์ messages.json
      const response = await axios.get("http://localhost:4452/json/messages.json");
      return response.data; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.push(action.payload);
    },
    deleteMessage: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        return action.payload; // อัพเดตสถานะด้วยข้อมูลที่ดึงมา
      })
      .addCase(fetchMessagesThunk.rejected, () => {
        console.error("Failed to fetch messages");
      });
  },
});

export const { addMessage, deleteMessage } = messageSlice.actions;

export default messageSlice.reducer;
