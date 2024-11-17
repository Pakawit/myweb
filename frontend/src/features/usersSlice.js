import { createSlice } from "@reduxjs/toolkit";
import usersData from "../json/users.json"; 

const initialState = [];

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action) {
      return [...action.payload]; 
    },
    deleteUsers: () => {
      return []; 
    },
  },
});

export const loadUsersData = () => async (dispatch) => {
  try {
    const data = usersData; 
    dispatch(setUsers(data)); 
  } catch (error) {
    console.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้", error);
  }
};

export const { setUsers, deleteUsers } = usersSlice.actions;

export default usersSlice.reducer;