import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Data from "../json/notification.json";

const initialState = Data;

export const removeNotificationThunk = createAsyncThunk(
  "notifications/removeNotificationThunk",
  async (userId, { dispatch }) => {
    const response = await fetch("http://localhost:5001/removeNotification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
    if (response.ok) {
      dispatch(removeNotification(userId));
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
    extraReducers: (builder) => {
      builder.addCase(removeNotificationThunk.fulfilled, (state, action) => {});
    },
  },
});

export const { addNotification, removeNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
