import React, { useState, useEffect } from "react";
import { Container, Dropdown } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import { ipcRenderer } from "electron";
import "bootstrap/dist/css/bootstrap.min.css";
import { hot } from "react-hot-loader";
import BootstrapSwitchButton from "bootstrap-switch-button-react";

import { useAlert } from "react-alert";
import { BsFilePlus, BsListUl, BsGear } from "react-icons/bs";
import { FaDev } from "react-icons/fa";

import Workentry from "./Workentry";
import WorkentryList from "./WorkentryList";

const App = () => {
  const [workentries, setWorkentries] = useState([]);
  const [show, setShow] = useState(false);
  let [isDev, setIsDev] = useState(process.env.NODE_ENV == "development");
  let [workentryToUpdate, setWorkentryToUpdate] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let alert = useAlert();

  function handleUpdate(entryToUpdate) {
    setWorkentryToUpdate(entryToUpdate);
    handleShow();
  }

  useEffect(() => {
    ipcRenderer.send("message:req");
    ipcRenderer.send("isDev:req");
    ipcRenderer.on("isDev:res", (e, w) => setIsDev(w));
    ipcRenderer.on("message:res", (e, message = []) => {
      message.map((m) => alert.show(`${m.message.substring(0, 40)}...`));
    });
  }, []);
  return (
    <div className="App-main">
      <Workentry
        show={show}
        isDev={isDev}
        handleClose={handleClose}
        workentries={workentries}
        setWorkentries={setWorkentries}
        workentryToUpdate={workentryToUpdate}
      />
      <WorkentryList isDev={isDev} workentries={workentries} handleUpdate={handleUpdate} />
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
        <Navbar.Brand>
          <BsListUl />
        </Navbar.Brand>
        <Navbar.Brand>
          {/* <Dropdown drop={"up"}>
            <Dropdown.Toggle variant="warning" className="">
              {isDev ? "Dev" : "Prod"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  console.log("Setting connection to dev");
                  setIsDev(true);
                }}
              >
                Dev
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  console.log("Setting connection to prod");
                  setIsDev(false);
                }}
              >
                Prod
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
          <BootstrapSwitchButton
            checked={!!isDev}
            onlabel="Dev"
            offlabel="Prod"
            width={100}
            onChange={() => {
              setIsDev(!isDev);
            }}
          />
        </Navbar.Brand>
      </Navbar>
    </div>
  );
};

export default hot(module)(App);
