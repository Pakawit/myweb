import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = [];

export const fetchHFSNotificationsThunk = createAsyncThunk(
  "hfsnotification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const notificationsData = await import("../json/hfsnotification.json");
      return notificationsData.default;
    } catch (error) {
      return rejectWithValue("Failed to fetch HFS notifications");
    }
  }
);

export const hfsnotificationSlice = createSlice({
  name: "hfsnotification",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchHFSNotificationsThunk.fulfilled, (state, action) => {
        return action.payload; 
      })
      .addCase(fetchHFSNotificationsThunk.rejected, () => {
        console.error("Failed to fetch HFS notifications");
      });
  },
});

export default hfsnotificationSlice.reducer;