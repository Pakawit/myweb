import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = [];

export const fetchNotificationsThunk = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:4452/getnotifications");
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch notifications");
    }
  }
);

export const removeNotificationThunk = createAsyncThunk(
  "notifications/removeNotificationThunk",
  async (from, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:4452/removeNotification", {
        from,
      });
      if (response.status === 200) {
        dispatch(removeNotification(from));
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      return action.payload; // อัปเดตด้วยข้อมูลที่ดึงมา
    },
    removeNotification: (state, action) => {
      return state.filter((n) => n.from !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        return action.payload; // อัปเดตสถานะด้วยข้อมูลที่ดึงมา
      })
      .addCase(removeNotificationThunk.rejected, (state, action) => {
        console.error("Failed to remove notification:", action.payload);
      });
  },
});

export const { addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;