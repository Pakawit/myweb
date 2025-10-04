import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import adminSlice from "./features/adminSlice";
import usersSlice from "./features/usersSlice";
import selectuserSlice from "./features/selectuserSlice";
import medicationSlice from "./features/medicationSlice";
import messageSlice from "./features/messageSlice";
import chatnotificationSlice from "./features/chatnotificationSlice";
import hfsnotificationSlice from "./features/hfsnotificationSlice";
import personalnotificationSlice from "./features/personalnotificationSlice";

const appReducer = combineReducers({
  admin: adminSlice,
  selectuser: selectuserSlice,

  users: usersSlice,
  medication: medicationSlice,
  message: messageSlice,
  chatnotification: chatnotificationSlice,
  hfsnotification: hfsnotificationSlice,
  personalnotification: personalnotificationSlice,
});

const rootReducer = (state, action) => {
  if (action.type === "RESET_STORE") {
    state = undefined; 
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["admin", "selectuser"], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    })
  ,
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export default store;