import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
  name: "users",
  initialState: null,
  reducers: {
    setUsers: (state, action) => {
      return action.payload;
    },
    deleteUsers: (state, action) => {
      return null;
    },
    updateUsers: (state, action) => {
      const index = state.findIndex(x => x._id === action.payload._id);
      state[index] = action.payload;
    },
  },
});

export const { setUsers, deleteUsers, updateUsers } = usersSlice.actions;

export default usersSlice.reducer;
