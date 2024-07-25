import React from "react";
import { Post } from "components/Post";
import { Loading } from "components/Loading";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Post />
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <Loading />
        </div>
      </header>
    </div>
  );
}

export default App;
