import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import userReducer from "./features/userSlice";
import usersReducer from "./features/usersSlice";
import medicationReducer from "./features/medicationSlice";
import messageReducer from "./features/messageSlice";
import estimationReducer from "./features/estimationSlice";

const rootReducer = combineReducers({
  user: userReducer,
  users: usersReducer,
  medication: medicationReducer,
  message: messageReducer,
  estimation: estimationReducer,
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: [], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
});

export default store;
