import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Data from '../json/estimations.json';

// สถานะเริ่มต้น
const initialState = Data;

// Thunk สำหรับดึงข้อมูลการประเมิน (estimation) จาก API
export const fetchEstimationsThunk = createAsyncThunk(
  "estimation/fetchEstimations",
  async (_, { rejectWithValue }) => {
    try {
       await axios.post("http://localhost:5001/getestimation");
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const estimationSlice = createSlice({
  name: "estimation",
  initialState,
  reducers: {
    addEstimation: (state, action) => {
      state.push(action.payload);
    },
    deleteEstimation: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstimationsThunk.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchEstimationsThunk.rejected, () => {
        console.error("Failed to fetch estimations");
      });
  },
});

export const { addEstimation, deleteEstimation } = estimationSlice.actions;

export default estimationSlice.reducer;
