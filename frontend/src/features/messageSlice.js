import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Data from "../json/messages.json";

// สถานะเริ่มต้น
const initialState = Data;

// Thunk สำหรับดึงข้อมูลข้อความจาก API
export const fetchMessagesThunk = createAsyncThunk(
  "message/fetchMessages",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("http://localhost:5001/getmessages");
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
    deleteMessage: (state, action) => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesThunk.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchMessagesThunk.rejected, () => {
        console.error("Failed to fetch messages");
      });
  },
});

export const { addMessage, deleteMessage } = messageSlice.actions;

export default messageSlice.reducer;
