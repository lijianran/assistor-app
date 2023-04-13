import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

import App from "./App";
import Home from "./pages/Home";
import Score from "./pages/Score";
import ErrorPage from "./components/ErrorPage";

import zhCN from "antd/locale/zh_CN";
import { ConfigProvider, Empty } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="/score" element={<Score />} />
            <Route
              path="/class/shuffle"
              element={<Empty description="尽情期待" />}
            />
            <Route
              path="/class/adjust"
              element={<Empty description="尽情期待" />}
            />

            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
