// import "./index.css";
// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./components/App";

// ReactDOM.render(<App />, document.getElementById("root"));

import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import { transitions, positions, Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement("div");

const options = {
    // you can also just use 'bottom center'
    position: positions.MIDDLE,
    timeout: 5000,
    offset: "30px",
    // you can also just use 'scale'
    transition: transitions.SCALE,
};

root.id = "root";
document.body.appendChild(root);

// Now we can render our application into it
render(
    <AlertProvider template={AlertTemplate} {...options}>
        <App />
    </AlertProvider>,
    document.getElementById("root")
);
