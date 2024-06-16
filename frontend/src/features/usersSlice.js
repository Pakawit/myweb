import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Data from "../json/users.json";

// สถานะเริ่มต้น
const initialState = Data;

// Thunk สำหรับดึงข้อมูลผู้ใช้ (users) จาก API
export const fetchUsersThunk = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      await axios.get("http://localhost:5001/getusers");
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.fulfilled, () => {
        return initialState;
      })

      .addCase(fetchUsersThunk.rejected, () => {
        console.error("Failed to fetch users");
      });

  },
});

export const { deleteUsers, updateUsers } = usersSlice.actions;

export default usersSlice.reducer;
