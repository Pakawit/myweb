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
  blacklist: [], // No need to blacklist anything if appApi is removed
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export default store;
