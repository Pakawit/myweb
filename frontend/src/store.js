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
import personalnotificationSlice from "./features/personalnotificationSlice";
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
  personalnotification: personalnotificationSlice,
  estimationHFS: estimationHFSSlice,
});

const persistConfig = {
  key: "root", // กำหนด key หลักสำหรับการ persist
  storage, // ใช้ local storage เป็นที่จัดเก็บข้อมูล
  blacklist: ["message"], // ระบุ slice ที่ไม่ต้องการเก็บใน local storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer); // สร้าง persisted reducer จาก rootReducer และ persistConfig

// ตั้งค่า store
const store = configureStore({
  reducer: persistedReducer, // ใช้ persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  // ปิดการตรวจสอบ serializable เพื่อหลีกเลี่ยง error จาก redux-persist
    }),
  devTools: process.env.NODE_ENV !== "production",   // เปิด DevTools ในโหมด development เท่านั้น
});

export default store;