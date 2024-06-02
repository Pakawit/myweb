import { createSlice } from "@reduxjs/toolkit";
import Data from '../json/messages.json';

export const messageSlice = createSlice({
  name: "message",
  initialState: Data,
  reducers: {
    showMessage: (state, action) => {
      return action.payload;
    },
    addMessage: (state, action) => {
      state.push(action.payload);
    },
    deleteMessage: (state, action) => {
      return [];
    },
  },
});

export const { showMessage, addMessage, deleteMessage } = messageSlice.actions;

export default messageSlice.reducer;
