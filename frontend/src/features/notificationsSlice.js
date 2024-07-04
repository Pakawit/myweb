import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Data from "../json/notification.json";

const initialState = Data;

export const removeNotificationThunk = createAsyncThunk(
  "notifications/removeNotificationThunk",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:5001/removeNotification", {
        userId,
      });
      if (response.status === 200) {
        dispatch(removeNotification(userId));
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
    addNotification: () => {
      return initialState;
    },
    removeNotification: (state, action) => {
      return state.filter((n) => n.userId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeNotificationThunk.fulfilled, () => {})
      .addCase(removeNotificationThunk.rejected, (state, action) => {
        console.error("Failed to remove notification:", action.payload);
      });
  },
});

export const { addNotification, removeNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
