import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import usersReducer from "./features/usersSlice";
import medicationReducer from "./features/medicationSlice";
import messageReducer from "./features/messageSlice";
import appApi from "./services/appApi"; 

import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";

const rootReducer = combineReducers({
    user: userReducer,
    users: usersReducer,
    medication: medicationReducer,
    message: messageReducer,
    [appApi.reducerPath]: appApi.reducer, 
});

const persistConfig = {
    key: "root",
    storage,
    blacklist: [appApi.reducerPath], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(appApi.middleware), 
});

export default store;
