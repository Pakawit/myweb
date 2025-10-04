import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

export const selectuserSlice = createSlice({
  name: "selectuser",
  initialState,
  reducers: {
    setselectuser: (_state, action) => (action.payload ?? null),

    deleteselectuser: () => null,
  },
});

// ---------- Thunks ----------
export const setSelectUserById =
  (userId) => (dispatch, getState) => {
    const users = getState().users || [];
    const user = users.find((u) => u._id === userId) || null;
    dispatch(selectuserSlice.actions.setselectuser(user));
  };

// ---------- Selectors ----------
export const selectSelectedUser = (state) => state.selectuser;
export const selectSelectedUserId = (state) => state.selectuser?._id || null;

// ---------- Exports ----------
export const { setselectuser, deleteselectuser } = selectuserSlice.actions;
export default selectuserSlice.reducer;
