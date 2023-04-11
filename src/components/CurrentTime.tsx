import { useState, useEffect } from "react";

import dayjs from "dayjs";

// const App: React.FC = () => (
function App() {
  const [currentTime, setCurrentTime] = useState(
    dayjs(`${new Date()}`).format("YYYY-MM-DD HH:mm:ss")
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs(`${new Date()}`).format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {currentTime}
      {/* <Space direction="vertical" size="large"> */}
      {/* </Space> */}
    </>
  );
}

export default App;
