import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { ipcRenderer } from "electron";
import "bootstrap/dist/css/bootstrap.min.css";
import { hot } from "react-hot-loader";

import { useAlert } from "react-alert";
import { BsFilePlus, BsListUl, BsGear } from "react-icons/bs";

import CreateWorkentry from "./CreateWorkentry";
import Workentry from "./Workentry";

const App = () => {
  const [workentries, setWorkentries] = useState([]);
  const CreateWorkentryComp = <CreateWorkentry workentries={workentries} setWorkentries={setWorkentries} />;
  const WorkentryComp = <Workentry workentries={workentries} />;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let alert = useAlert();

  let [activeComponent, setActiveComponent] = useState(CreateWorkentryComp);

  // function addItem(item) {
  //     if (item.text === "" || item.user === "" || item.priority === "") {
  //         showAlert("Please enter all fields", "danger");
  //         return false;
  //     }
  // item._id = Math.floor(Math.random() * 90000) + 1000;
  // item.created = new Date().toString();
  // setLogs([...logs, item]);

  // ipcRenderer.send("logs:add", item);

  // showAlert("Bug reported");
  // }

  // function showAlert(message = "", variant = "success", seconds = 3000) {
  //     setAlert({ message, variant, show: true });

  //     setTimeout(() => setAlert({ message: "", variant: "success", show: false }), seconds);
  // }

  // function deleteItem(_id) {
  //     // setLogs(logs.filter((l) => l._id !== _id));
  //     ipcRenderer.send("logs:delete", _id);
  //     showAlert("Log removed");
  // }
  // const [alert, setAlert] = useState({
  //     show: false,
  //     message: "",
  //     variant: "success",
  // });

  useEffect(() => {
    ipcRenderer.send("message:req");
    ipcRenderer.on("message:res", (e, message = []) => {
      console.log("message:res", message);
      message.map((m) => alert.show(`${m.message.substring(0, 40)}...`));
    });
    // ipcRenderer.send("logs:load");
    // ipcRenderer.on("logs:get", (e, logs) => {
    //     setLogs(JSON.parse(logs));
    // });
    // ipcRenderer.on("logs:clear", () => {
    //     setLogs([]);
    //     showAlert("Logs cleared");
    // });
  }, []);
  // const [logs, setLogs] = useState(initData);
  return (
    <div className="App-main">
      {/* <CreateWorkentry />
            <hr />
            <Workentry /> */}
      {/* {activeComponent} */}
      <CreateWorkentry
        show={show}
        handleClose={handleClose}
        workentries={workentries}
        setWorkentries={setWorkentries}
      />
      <Workentry workentries={workentries} />
      <Navbar
        className="navbar-bottom"
        fixed="bottom"
        variant="light"
        bg="light"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Navbar.Brand onClick={handleShow}>
          <BsFilePlus />
        </Navbar.Brand>
        <Navbar.Brand onClick={() => setActiveComponent(WorkentryComp)}>
          <BsListUl />
        </Navbar.Brand>
        <Navbar.Brand>
          <BsGear />
        </Navbar.Brand>
      </Navbar>
    </div>
  );
};

export default hot(module)(App);
