import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = [];

export const fetchEstimationHFSThunk = createAsyncThunk(
  "estimationHFS/fetchEstimationHFS",
  async (_, { rejectWithValue }) => {
    try {
      const estimationHFSData = await import("../json/estimationHFS.json");
      return estimationHFSData.default; 
    } catch (error) {
      return rejectWithValue("Failed to fetch estimation HFS data");
    }
  }
);

export const estimationHFSSlice = createSlice({
  name: "estimationHFS",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstimationHFSThunk.fulfilled, (state, action) => {
        return action.payload; 
      })
      .addCase(fetchEstimationHFSThunk.rejected, (state, action) => {
        console.error(action.payload || "Failed to fetch estimation HFS data");
      });
  },
});

export default estimationHFSSlice.reducer;