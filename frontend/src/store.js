import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import adminSlice from "./features/adminSlice";
import usersSlice from "./features/usersSlice";
import selectuserSlice from "./features/selectuserSlice";
import medicationSlice from "./features/medicationSlice";
import messageSlice from "./features/messageSlice";
import chatnotificationSlice from "./features/chatnotificationSlice";
import hfsnotificationSlice from "./features/hfsnotificationSlice";
import personalSlice from "./features/personalSlice";
import estimationHFSSlice from "./features/estimationHFSSlice";

const rootReducer = combineReducers({
  admin: adminSlice,
  users: usersSlice,
  selectuser: selectuserSlice,
  medication: medicationSlice,
  message: messageSlice,
  chatnotification: chatnotificationSlice,
  hfsnotification: hfsnotificationSlice,
  personal: personalSlice,
  estimationHFS: estimationHFSSlice,
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["message"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production" && {
    serialize: {
      options: {
        maxDepth: 2,
      },
    },
    actionsDenylist: ["SOME_LARGE_ACTION_TYPE"],
    stateSanitizer: (state) =>
      state.largeProperty
        ? { ...state, largeProperty: "<<LARGE_STATE>>" }
        : state,
    actionSanitizer: (action) =>
      action.type === "SOME_LARGE_ACTION_TYPE"
        ? { ...action, largeProperty: "<<LARGE_ACTION>>" }
        : action,
  },
});

export default store;