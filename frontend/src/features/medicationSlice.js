import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Data from '../json/medications.json';

// สถานะเริ่มต้น
const initialState = Data;

// Thunk สำหรับดึงข้อมูลยา (medication) จาก API
export const fetchMedicationsThunk = createAsyncThunk(
  "medication/fetchMedications",
  async (_, { rejectWithValue }) => {
    try {
       await axios.post("http://localhost:5001/getmedication");
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const medicationSlice = createSlice({
  name: "medication",
  initialState,  
  reducers: {
    addMedication: (state, action) => {
      state.push(action.payload);
    },
    deleteMedication: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicationsThunk.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchMedicationsThunk.rejected, () => {
        console.error("Failed to fetch medications");
      });
  },
});

export const { addMedication, deleteMedication } = medicationSlice.actions;

export default medicationSlice.reducer;
