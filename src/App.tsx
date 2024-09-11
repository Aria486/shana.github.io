import React from "react";
import { Post } from "components/Post";
import { Loading } from "components/Loading";
import { FirstGL } from "webGL";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Post />
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <Loading />
          <FirstGL />
        </div>
      </header>
    </div>
  );
}

export default App;
