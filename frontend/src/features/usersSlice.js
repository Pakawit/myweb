import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../config";

const initialState = [];

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (_state, action) => [...(action.payload || [])],
    deleteUsers: () => [],
  },
});

export const loadUsersData = () => async (dispatch) => {
  try {
    const res = await axios.get(`${config.API_BASE_URL}/getusers`);
    dispatch(setUsers(res.data || []));
  } catch (error) {
    console.error("❌ ไม่สามารถโหลดข้อมูลผู้ใช้ได้:", error);
  }
};

export const { setUsers, deleteUsers } = usersSlice.actions;
export default usersSlice.reducer;