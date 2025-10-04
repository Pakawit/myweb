import { createContext } from "react";
import config from "../config";

export const AppContext = createContext({
  API_BASE_URL: config.API_BASE_URL,
});
