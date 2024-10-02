import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial state for estimation HFS data
const initialState = [];

// Thunk to fetch estimation HFS data from JSON file using Dynamic Import
export const fetchEstimationHFSThunk = createAsyncThunk(
  "estimationHFS/fetchEstimationHFS",
  async (_, { rejectWithValue }) => {
    try {
      // Dynamically import estimationHFS.json
      const estimationHFSData = await import("../json/estimationHFS.json");
      return estimationHFSData.default; // Return the data from the JSON file
    } catch (error) {
      return rejectWithValue("Failed to fetch estimation HFS data");
    }
  }
);

// Create the slice for estimation HFS
export const estimationHFSSlice = createSlice({
  name: "estimationHFS",
  initialState,
  reducers: {
    addEstimationHFS: (state, action) => {
      state.push(action.payload); // Add new estimation data
    },
    deleteEstimationHFS: () => {
      return []; // Remove all estimation data
    },
    updateEstimationHFS: (state, action) => {
      return state.map((estimation) =>
        estimation._id === action.payload._id ? action.payload : estimation
      ); // Update existing estimation data
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstimationHFSThunk.fulfilled, (state, action) => {
        return action.payload; // Update state with fetched data
      })
      .addCase(fetchEstimationHFSThunk.rejected, (state, action) => {
        console.error(action.payload || "Failed to fetch estimation HFS data");
      });
  },
});

// Export actions
export const { addEstimationHFS, deleteEstimationHFS, updateEstimationHFS } = estimationHFSSlice.actions;

// Export the reducer as default
export default estimationHFSSlice.reducer;
