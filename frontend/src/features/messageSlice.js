import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      return action.payload; // อัปเดต state ด้วยข้อมูลจาก action.payload
    },
    addMessage: (state, action) => {
      state.push(action.payload); // เพิ่มข้อความใหม่ลงใน array ของ state
    },
    deleteMessage: () => {
      return [];
    },
  },
});

export const { addMessage, deleteMessage, setMessages } = messageSlice.actions;

export default messageSlice.reducer;
