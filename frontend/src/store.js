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

// รวม reducers ทั้งหมดใน rootReducer
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
  blacklist: ["message"], // ระบุ slice ที่ไม่ต้องการเก็บใน local storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ตั้งค่า store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
  devTools: process.env.NODE_ENV !== "production", 
});

export default store;