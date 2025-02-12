import { useState } from "react";
import Preloader from "./components/Preloader";
import Home from "./pages/Home";

const App = () => {
  const [isPreloading, setIsPreloading] = useState(true);

  return (
    <>
      {isPreloading && <Preloader onFinish={() => setIsPreloading(false)} />}
      <Home isPreloading={isPreloading} />
    </>
  );
};

export default App;
