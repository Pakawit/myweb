import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import adminSlice from "./features/adminSlice";
import usersReducer from "./features/usersSlice";
import selectuserSlice from "./features/selectuserSlice";
import medicationReducer from "./features/medicationSlice";
import messageReducer from "./features/messageSlice";
import estimationReducer from "./features/estimationSlice";
import notificationsReducer from "./features/notificationsSlice";

const rootReducer = combineReducers({
  admin: adminSlice,
  users: usersReducer,
  selectuser: selectuserSlice,
  medication: medicationReducer,
  message: messageReducer,
  estimation: estimationReducer,
  notifications: notificationsReducer,
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
    }),
  devTools: process.env.NODE_ENV !== 'production' && {
    serialize: {
      options: {
        maxDepth: 2, // กำหนดความลึกสูงสุดของ serialization
      },
    },
    actionsDenylist: ['SOME_LARGE_ACTION_TYPE'], 
    stateSanitizer: (state) => state.largeProperty ? { ...state, largeProperty: '<<LARGE_STATE>>' } : state,
    actionSanitizer: (action) => action.type === 'SOME_LARGE_ACTION_TYPE' ? { ...action, largeProperty: '<<LARGE_ACTION>>' } : action,
  },
});

export default store;
