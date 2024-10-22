import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = [];

export const fetchPersonalDataThunk = createAsyncThunk(
  "personal/fetchPersonalData",
  async (_, { rejectWithValue }) => {
    try {
      const personalData = await import('../json/personal.json');
      return personalData.default; 
    } catch (error) {
      return rejectWithValue("Failed to fetch personal data");
    }
  }
);

export const personalSlice = createSlice({
  name: "personal",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonalDataThunk.fulfilled, (state, action) => {
        return action.payload; 
      })
      .addCase(fetchPersonalDataThunk.rejected, () => {
        console.error("Failed to fetch personal data");
      });
  },
});

export default personalSlice.reducer;