import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = [];

export const fetchChatNotificationThunk = createAsyncThunk(
  "chatnotification/fetchChatNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:4452/getchatnotification"
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch notifications");
    }
  }
);

export const removeChatNotificationThunk = createAsyncThunk(
  "chatnotification/removeChatNotificationThunk",
  async (from, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4452/removechatnotification",
        {
          from,
        }
      );
      if (response.status === 200) {
        dispatch(removeChatNotification(from));
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatnotificationSlice = createSlice({
  name: "chatnotification",
  initialState,
  reducers: {
    removeChatNotification: (state, action) => {
      return state.filter((n) => n.from !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatNotificationThunk.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(removeChatNotificationThunk.rejected, (state, action) => {
        console.error("Failed to remove notification:", action.payload);
      });
  },
});

export const { removeChatNotification } = chatnotificationSlice.actions;
export default chatnotificationSlice.reducer;