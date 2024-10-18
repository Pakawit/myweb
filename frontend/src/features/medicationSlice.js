import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = [];

export const fetchMedicationsThunk = createAsyncThunk(
  "medication/fetchMedications",
  async (_, { rejectWithValue }) => {
    try {
      const medicationsData = await import('../json/medications.json'); 
      return medicationsData.default;
    } catch (error) {
      return rejectWithValue("Failed to fetch medications");
    }
  }
);

export const medicationSlice = createSlice({
  name: "medication",
  initialState,
  reducers: {
    deleteMedication: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicationsThunk.fulfilled, (state, action) => {
        return action.payload; 
      })
      .addCase(fetchMedicationsThunk.rejected, () => {
        console.error("Failed to fetch medications");
      });
  },
});

export const { deleteMedication } = medicationSlice.actions;

export default medicationSlice.reducer;