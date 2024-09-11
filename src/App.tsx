import React from "react";
import { Theme, Loading, Post } from "components";
import "./App.css";

function App() {
  return (
    <Theme>
      <div className="App">
        <header className="App-header">
          <Post />
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <Loading />
          </div>
        </header>
      </div>
    </Theme>
  );
}

export default App;
