import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import moment from "moment";
import axios from "axios";
import { useAlert } from "react-alert";
import { ipcRenderer } from "electron";
import { v4 as uuidv4 } from "uuid";
import {
    BsFillCaretRightFill,
    BsFillPauseFill,
    BsFillTrashFill,
    BsFillForwardFill,
    BsFillClockFill,
} from "react-icons/bs";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

const CATEGORY_URL = "http://localhost:8080/api/v1/category/";
const PROJECT_URL = "http://localhost:8080/api/v1/project/";
const WORKENTRY_URL = "http://localhost:8080/api/v1/workentry";

export default function CreateWorkentry({
    show,
    handleClose,
    workentries,
    setWorkentries,
}) {
    let [categories, setCategories] = useState([{ id: 0, categoryName: "C1" }]);
    let [projects, setProjects] = useState([{ id: 0, projectName: "P1" }]);
    let [selectedProject, setSelectedProject] = useState(undefined);
    let [selectedCategory, setSelectedCategory] = useState(undefined);
    let [newWorkentryState, setNewWorkentryState] = useState(undefined);
    let [optionalText, setOptionalText] = useState("");
    let [startTimeTmp, setStartTimeTmp] = useState("");
    let [startTime, setStartTime] = useState(undefined);
    let [endTime, setEndTime] = useState(undefined);
    let [endTimeTmp, setEndTimeTmp] = useState("");
    let [isTracking, setIsTracking] = useState(false);
    let [isDisabled, setIsDisabled] = useState(true);
    let [customInterval, setCustomInterval] = useState(null);
    let alert = useAlert();

    function reset() {
        setSelectedCategory(undefined);
        setSelectedProject(undefined);
        setOptionalText("");
        setStartTime(undefined);
        setEndTime(undefined);
        setStartTimeTmp("");
        setEndTimeTmp("");
        endTrack();
    }

    useEffect(() => {
        if (newWorkentryState == undefined) return;
        ipcRenderer.send("workentrycreate:new", newWorkentryState);
        handleClose();
    }, [newWorkentryState]);

    useEffect(() => {
        ipcRenderer.send("workentrycreate:load");
        ipcRenderer.send("categories:load");
        ipcRenderer.send("projects:load");
        ipcRenderer.on("workentrycreate:get", (e, w) => {
            const { categories, projects } = JSON.parse(w);
            categories && setCategories(categories);
            projects && setProjects(projects);
        });
        ipcRenderer.on("categories:get", (e, w) => {
            const categories = JSON.parse(w);
            setCategories(categories);
        });
        ipcRenderer.on("projects:get", (e, w) => {
            const projects = JSON.parse(w);
            setProjects(projects);
        });
        ipcRenderer.on("workentrycreate:created", (e, w) => {
            // setWorkentries([...workentries, newWorkentryState]);
            alert.show("Zeiteintrag erfolgreich gespeichert");
            reset();
        });
        ipcRenderer.on("workentrycreate:failed", (e, w) => {
            // setWorkentries([...workentries, newWorkentry]);
            alert.show("Fehler beim Speichern des Zeiteintrags");
            // reset();
        });
    }, []);

    useEffect(() => {
        if (
            !!startTime &&
            !!endTime &&
            !!selectedCategory &&
            !!selectedProject
        ) {
            return setIsDisabled(false);
        }
        setIsDisabled(true);
    }, [selectedCategory, selectedProject, startTime, endTime]);

    function track() {
        if (isTracking) {
            endTrack();
        } else {
            startTrack();
        }
    }
    function startTrack() {
        setIsTracking(true);
        setStartTime(moment().format("HH:mm"));
        setStartTimeTmp(moment().format("HH:mm"));
        let interval = setInterval(() => {
            let now = new Date();
            setEndTimeTmp(moment().format("HH:mm"));
            setEndTime(moment().format("HH:mm"));
        }, 1000);
        setCustomInterval(interval);
    }
    function endTrack() {
        setIsTracking(false);
        clearInterval(customInterval);
    }

    function createWorkentry() {
        let newWorkentry = {
            // id: uuidv4(),
            projectName: selectedProject._id,
            categoryName: selectedCategory._id,
            fromDate: startTime,
            untilDate: endTime,
            optionalText: optionalText,
        };
        setNewWorkentryState(newWorkentry);
        // console.log("newWorkentry",   newWorkentry);
        // ipcRenderer.send("workentrycreate:new", newWorkentry);
        // setWorkentries([...workentries, newWorkentry]);
        // alert.show("Zeiteintrag erfolgreich gespeichert");
        // reset();
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Neuer Zeiteintrag</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Dropdown className="mb-3 ">
                    <Dropdown.Toggle variant="warning" className="" block>
                        {selectedProject
                            ? selectedProject.projectName
                            : "Projekt"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {projects.map((p) => (
                            <Dropdown.Item
                                key={p._id}
                                onSelect={() =>
                                    setSelectedProject({
                                        _id: p._id,
                                        projectName: p.projectName,
                                    })
                                }
                            >
                                {p.projectName}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown className="mb-3">
                    <Dropdown.Toggle variant="warning" block>
                        {selectedCategory
                            ? selectedCategory.categoryName
                            : "Kategorie"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {categories.map((c) => (
                            <Dropdown.Item
                                key={c._id}
                                onSelect={() =>
                                    setSelectedCategory({
                                        _id: c._id,
                                        categoryName: c.categoryName,
                                    })
                                }
                            >
                                {c.categoryName}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <BsFillClockFill />
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        placeholder="Von"
                        type="time"
                        value={startTimeTmp}
                        onChange={(e) => setStartTimeTmp(e.target.value)}
                        onBlur={(e) => {
                            setStartTime(
                                moment(startTimeTmp, "HH:mm").format("HH:mm")
                            );
                        }}
                    />
                    <InputGroup.Text>
                        <BsFillForwardFill />
                    </InputGroup.Text>
                    <FormControl
                        onBlur={(e) =>
                            setEndTime(
                                moment(endTimeTmp, "HH:mm").format("HH:mm")
                            )
                        }
                        // value={endTime ? `${endTime.getHours()}:${endTime.getMinutes()}` : undefined}
                        // value={isTracking ? endTime : undefined}

                        onChange={(e) => setEndTimeTmp(e.target.value)}
                        value={endTimeTmp}
                        placeholder="Bis"
                        type="time"
                    />
                </InputGroup>
                <InputGroup className="mb-3">
                    <FormControl
                        onChange={(e) => setOptionalText(e.target.value)}
                        value={optionalText}
                        placeholder="Kommentar"
                        aria-label="Kommentar"
                        aria-describedby="basic-addon2"
                    />
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant={isTracking ? "danger" : "secondary"}
                    onClick={track}
                >
                    {isTracking ? "Stop" : "Track"}
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="secondary" onClick={reset}>
                    Reset
                </Button>
                <Button
                    variant="warning"
                    disabled={isDisabled}
                    onClick={createWorkentry}
                >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
