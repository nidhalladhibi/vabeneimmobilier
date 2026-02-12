import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Corrigé pour React 18
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

// Créer le root avec React 18
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
