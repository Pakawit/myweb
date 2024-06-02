import { createSlice } from "@reduxjs/toolkit";
import Data from '../json/users.json'

export const usersSlice = createSlice({
  name: "users",
  initialState: Data,
  reducers: {
    setUsers: (state, action) => {
      return action.payload;
    },
    deleteUsers: (state, action) => {
      return [];
    },
    updateUsers: (state, action) => {
      const index = state.findIndex(x => x._id === action.payload._id);
      state[index] = { ...action.payload }; 
    },
  },
});

export const { setUsers, deleteUsers, updateUsers } = usersSlice.actions;

export default usersSlice.reducer;
