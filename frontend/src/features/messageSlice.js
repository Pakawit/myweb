import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = [];

export const fetchMessagesThunk = createAsyncThunk(
  "message/fetchMessages",
  async ({ from, to }, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:4452/getmessage", {
        from,
        to,
      });
      return response.data; 
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
        return action.payload; 
      })
      .addCase(fetchMessagesThunk.rejected, () => {
        console.error("Failed to fetch messages");
      });
  },
});

export const { addMessage, deleteMessage } = messageSlice.actions;

export default messageSlice.reducer;