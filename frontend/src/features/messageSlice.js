import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      return action.payload; 
    },
    addMessage: (state, action) => {
      state.push(action.payload);
    },
    deleteMessage: () => {
      return [];
    },
  },
});

export const { addMessage, deleteMessage, setMessages } = messageSlice.actions;

export default messageSlice.reducer;
