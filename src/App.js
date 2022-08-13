import logo from "./logo.svg";
import "./App.css";
import { WasmContainer } from "./components/wasm-ffmpeg";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <WasmContainer />
      </header>
    </div>
  );
}

export default App;
