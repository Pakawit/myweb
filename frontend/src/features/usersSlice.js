import { createSlice } from "@reduxjs/toolkit";
import Data from "../json/users.json";

const initialState = Data;

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {

    setUsers: () => {
      return initialState;
    },

    deleteUsers: () => {
      return [];
    },

    updateUsers: (state, action) => {
      const index = state.findIndex((user) => user._id === action.payload._id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
  },
});

export const { setUsers, deleteUsers, updateUsers } = usersSlice.actions;

export default usersSlice.reducer;
