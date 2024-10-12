import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = [];

export const fetchUsersThunk = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const usersData = await import('../json/users.json');
      return usersData.default; 
    } catch (error) {
      return rejectWithValue("Failed to fetch users");
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        return action.payload; 
      })
      .addCase(fetchUsersThunk.rejected, () => {
        console.error("Failed to fetch users");
      });
  },
});

export const { deleteUsers } = usersSlice.actions;

export default usersSlice.reducer;