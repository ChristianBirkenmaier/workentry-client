import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import { ipcRenderer } from "electron";
import { hot } from "react-hot-loader";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { BsFilePlus, BsListUl } from "react-icons/bs";
import { useAlert } from "react-alert";

import "bootstrap/dist/css/bootstrap.min.css";

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
            <WorkentryList isDev={isDev} workentries={workentries} setWorkentries={setWorkentries} handleUpdate={handleUpdate} />
            <Navbar className="navbar-bottom" fixed="bottom" style={{ display: "flex", justifyContent: "space-between" }}>
                <Navbar.Brand onClick={handleShow}>
                    <BsFilePlus />
                </Navbar.Brand>
                <Navbar.Brand>
                    <BsListUl />
                </Navbar.Brand>
                <Navbar.Brand>
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
