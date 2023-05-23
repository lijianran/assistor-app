import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import Home from "./pages/Home";
import Score from "./pages/Score";
import ClassShutffle from "./pages/ClassShuffle";
import ClassAssign from "./pages/ClassAssign";
import ClassAdjust from "./pages/ClassAdjust";
import Update from "./pages/Update";
import Settings from "./pages/Settings";
import ErrorPage from "./pages/ErrorPage";

import zhCN from "antd/locale/zh_CN";
import { ConfigProvider, Empty, theme } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
      locale={zhCN}
    >
      <Settings />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="/score" element={<Score />} />
            <Route path="/class/shuffle" element={<ClassShutffle />} />
            <Route path="/class/assign" element={<ClassAssign />} />
            <Route path="/class/adjust" element={<ClassAdjust />} />

            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Update />
    </ConfigProvider>
  </React.StrictMode>
);
