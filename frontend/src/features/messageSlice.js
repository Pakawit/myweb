import { createSlice } from "@reduxjs/toolkit";
import Data from "../json/messages.json";

const initialState = Data;

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    showMessage: () => {
      return initialState;
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
