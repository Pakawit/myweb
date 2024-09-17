import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// สถานะเริ่มต้นเป็น array เปล่า
const initialState = [];

// Thunk สำหรับดึงข้อมูลข้อความระหว่างสองคนจาก API
export const fetchMessagesThunk = createAsyncThunk(
  "message/fetchMessages",
  async ({ from, to }, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:4452/getmessage", {
        from,
        to,
      });
      return response.data; // คืนค่าข้อมูลที่ดึงมา
    } catch (error) {
      return rejectWithValue("Failed to fetch messages");
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