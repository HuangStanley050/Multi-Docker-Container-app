import React from "react";
import Fibs from "./Fib";
import OtherPage from "./OtherPage";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <Link to="/">Home</Link>
          <Link to="/otherpage">OtherPage</Link>
        </header>
        <Route exact path="/" component={Fibs} />
        <Route path="/otherpage" component={OtherPage} />
      </div>
    </Router>
  );
}

export default App;
