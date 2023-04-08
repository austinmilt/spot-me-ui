import React from "react";
import ReactDOMClient from "react-dom/client";
import "./index.css";
import App from "app/app";

ReactDOMClient.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
