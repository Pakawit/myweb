import { createSlice } from "@reduxjs/toolkit";

export const messageSlice = createSlice({
  name: "message",
  initialState: "",
  reducers: {
    showMessage: (state, action) => {
      return action.payload;
    },
    addMessage: (state, action) => {
      state.push(action.payload);
    },
    deleteMessage: (state, action) => {
      return null;
    },
  },
});

export const { showMessage, addMessage, deleteMessage } = messageSlice.actions;

export default messageSlice.reducer;
