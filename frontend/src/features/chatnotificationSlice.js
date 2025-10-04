// src/features/chatnotificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../config"; // ← ใช้ config ที่คุณมีอยู่

// แปลงผลลัพธ์ให้เป็น object map เสมอ: { [userId]: { from, createdAt } }
function normalizeToMap(data) {
  if (Array.isArray(data)) {
    const map = {};
    for (const item of data) {
      if (!item || !item.from) continue;
      map[item.from] = {
        from: item.from,
        createdAt: item.createdAt || item.updatedAt || item.timestamp || null,
      };
    }
    return map;
  }
  if (data && typeof data === "object") {
    return { ...data };
  }
  return {};
}

export const fetchChatNotifications = createAsyncThunk(
  "chatnotification/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/getchatnotification`);
      return normalizeToMap(res.data);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้"
      );
    }
  }
);

export const removeChatNotification = createAsyncThunk(
  "chatnotification/remove",
  async (from, { rejectWithValue }) => {
    try {
      await axios.post(`${config.API_BASE_URL}/removechatnotification`, { from });
      return from; // คืน userId ที่ถูกลบ
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || "ไม่สามารถลบการแจ้งเตือนได้"
      );
    }
  }
);

const chatnotificationSlice = createSlice({
  name: "chatnotification",
  initialState: {}, // เก็บเป็น map: { [userId]: {from, createdAt} }
  reducers: {
    clearChatNotifications: () => {
      return {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatNotifications.fulfilled, (_state, action) => {
        return action.payload || {};
      })
      .addCase(removeChatNotification.fulfilled, (state, action) => {
        delete state[action.payload];
      });
  },
});

export const { clearChatNotifications } = chatnotificationSlice.actions;
export default chatnotificationSlice.reducer;