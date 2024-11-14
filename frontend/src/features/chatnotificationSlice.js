import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = [];

export const fetchChatNotifications = createAsyncThunk(
  "chatnotification/fetch",
  async (_, { rejectWithValue }) => {
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
  async (from, { rejectWithValue }) => {
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatNotifications.fulfilled, (state, action) => action.payload)
      .addCase(removeChatNotification.fulfilled, (state, action) =>
        state.filter((notification) => notification.from !== action.payload)
      );
  },
});

export default chatnotificationSlice.reducer;
