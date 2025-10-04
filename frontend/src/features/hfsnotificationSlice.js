import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { AppContext } from "../context/appContext";

export const loadHFSNotifications = createAsyncThunk(
  "hfsnotification/load",
  async (_, { getState, rejectWithValue }) => {
    try {
    
      const API_BASE_URL =
        window.__APP_CONTEXT__?.API_BASE_URL ||
        AppContext?._currentValue?.API_BASE_URL;

      const res = await axios.get(`${API_BASE_URL}/gethfsnotification`);
      const list = Array.isArray(res.data) ? res.data : [];

      const byEstimationId = {};
      const userHasAlerts = {};

      for (const n of list) {
        if (!n?.estimationId) continue;
        byEstimationId[n.estimationId] = {
          estimationId: n.estimationId,
          userId: n.userId,
          createdAt: n.createdAt,
        };
        if (n?.userId) userHasAlerts[n.userId] = true;
      }

      return { byEstimationId, userHasAlerts, all: list };
    } catch (err) {
      return rejectWithValue(err?.message || "failed to load");
    }
  }
);

const initialState = {
  byEstimationId: {}, 
  userHasAlerts: {},  
  all: [],           
  loading: false,
  error: null,
};

const hfsnotificationSlice = createSlice({
  name: "hfsnotification",
  initialState,
  reducers: {
    clearHfsNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHFSNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHFSNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.byEstimationId = action.payload.byEstimationId;
        state.userHasAlerts = action.payload.userHasAlerts;
        state.all = action.payload.all;
      })
      .addCase(loadHFSNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "error";
      });
  },
});

export const { clearHfsNotifications } = hfsnotificationSlice.actions;
export default hfsnotificationSlice.reducer;