import React, { useState, useEffect } from "react";
// import Button from "react-bootstrap/Button";
// import Dropdown from "react-bootstrap/Dropdown";
import moment from "moment";
import axios from "axios";
import { useAlert } from "react-alert";
import { ipcRenderer } from "electron";
import { BsFillForwardFill, BsFillClockFill } from "react-icons/bs";
// import Modal from "react-bootstrap/Modal";
// import InputGroup from "react-bootstrap/InputGroup";
// import FormControl from "react-bootstrap/FormControl";
import { ButtonGroup, FormControl, InputGroup, Modal, Dropdown, Button } from "react-bootstrap";
import {
  PROD_WORKENTRY_API,
  PROD_CATEGORY_API,
  PROD_PROJECT_API,
  DEV_WORKENTRY_API,
  DEV_CATEGORY_API,
  DEV_PROJECT_API,
} from "../config/api.json";
const regeneratorRuntime = require("regenerator-runtime");

export default function Workentry({ show, handleClose, workentries, setWorkentries, isDev, workentryToUpdate }) {
  const DEV_URLS = { workentriesUrl: DEV_WORKENTRY_API, categoriesUrl: DEV_CATEGORY_API, projectsUrl: DEV_PROJECT_API };
  const PROD_URLS = {
    workentriesUrl: PROD_WORKENTRY_API,
    categoriesUrl: PROD_CATEGORY_API,
    projectsUrl: PROD_PROJECT_API,
  };
  let [mode, setMode] = useState("create");
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
  let [errorState, setErrorState] = useState(false);
  let [idToUpdate, setIdToUpdate] = useState(null);
  let [isExternal, setisExternal] = useState(false);
  const [urls, setUrls] = useState(isDev ? DEV_URLS : PROD_URLS);

  let alert = useAlert();

  function reset() {
    setMode("create");
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
    setUrls(isDev ? DEV_URLS : PROD_URLS);
  }, [isDev]);

  useEffect(() => {
    loadCategoriesAndProjects();
  }, [urls]);

  useEffect(() => {
    if (newWorkentryState == undefined) return;
    // ipcRenderer.send("workentrycreate:new", newWorkentryState);
    handleClose();
  }, [newWorkentryState]);

  useEffect(() => {
    if (!workentryToUpdate) return;
    setMode("update");
    console.log("workentryToUpdate", workentryToUpdate);
    const { _id, category, project, fromDate, untilDate, optionalText } = workentryToUpdate;
    setIdToUpdate(_id);
    setSelectedCategory(category);
    setSelectedProject(project);
    setStartTime(fromDate);
    setStartTimeTmp(fromDate);
    setEndTime(untilDate);
    setEndTimeTmp(untilDate);
    setOptionalText(optionalText);
  }, [workentryToUpdate]);

  useEffect(() => {
    loadCategoriesAndProjects();
  }, []);

  async function loadCategoriesAndProjects() {
    console.log("loadCategoriesAndProjects, isDev: ", isDev);
    try {
      let [categories, projects] = await Promise.all([axios.get(urls.categoriesUrl), axios.get(urls.projectsUrl)]);
      setCategories(categories.data.data);
      setProjects(projects.data.data);
    } catch (err) {
      console.error(err);
      setCategories([]);
      setProjects([]);
      setErrorState(true);
    }
  }

  useEffect(() => {
    if (!!startTime && !!endTime && !!selectedCategory && !!selectedProject) {
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
    console.log("startTrack", moment().format("YYYY-MM-DDTkk:mm"));
    setStartTime(moment().format("YYYY-MM-DDTkk:mm"));
    setStartTimeTmp(moment().format("YYYY-MM-DDTkk:mm"));
    let interval = setInterval(() => {
      let now = new Date();
      setEndTimeTmp(moment().format("YYYY-MM-DDTkk:mm"));
      setEndTime(moment().format("YYYY-MM-DDTkk:mm"));
    }, 1000);
    setCustomInterval(interval);
  }
  function endTrack() {
    setIsTracking(false);
    clearInterval(customInterval);
  }

  async function updateWorkentry() {
    if (!isDev) {
      alert.show("Vorsicht, posten unter neuer Version an Prod DB kann zu Fehlern im Livesystem führen");
      return;
    }
    try {
      let updateWorkentry = {
        project: selectedProject._id,
        category: selectedCategory._id,
        fromDate: startTime,
        untilDate: endTime,
        optionalText: optionalText || "",
      };
      let resp = await axios.put(`${urls.workentriesUrl}/${idToUpdate}`, updateWorkentry);
      reset();
      handleClose();
      alert.show("Zeiteintrag erfolgreich aktualisiert");
      let recievedData = resp && resp.data && resp.data.data && resp.data.data[0];
      let filteredWorkentries = workentries.filter((w) => w._id != recievedData._id);
      setWorkentries([...filteredWorkentries, recievedData]);
    } catch (err) {
      console.error(err);
    }
  }

  async function createWorkentry() {
    if (!isDev) {
      alert.show("Vorsicht, posten unter neuer Version an Prod DB kann zu Fehlern im Livesystem führen");
      return;
    }
    try {
      let newWorkentry = {
        project: selectedProject._id,
        category: selectedCategory._id,
        fromDate: startTime,
        untilDate: endTime,
        optionalText: optionalText || "",
        external: isExternal,
      };
      console.log(newWorkentry);

      let resp = await axios.post(urls.workentriesUrl, newWorkentry);
      reset();
      handleClose();
      alert.show("Zeiteintrag erfolgreich gespeichert");
      let recievedData = resp && resp.data && resp.data.data && resp.data.data[0];
      let filteredWorkentries = workentries.filter((w) => w._id != recievedData._id);
      setWorkentries([...filteredWorkentries, recievedData]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{mode == "update" ? "Zeiteintrag bearbeiten" : "Neuer Zeiteintrag"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Dropdown className="mb-3 " drop={"left"}>
          <Dropdown.Toggle variant="warning" className="" block>
            {selectedProject ? selectedProject.project : "Projekt"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {projects
              .sort((a, b) => {
                return a.project < b.project ? -1 : a.project > b.project ? 1 : 0;
              })
              .map((p) => (
                <Dropdown.Item
                  key={p._id}
                  onSelect={() =>
                    setSelectedProject({
                      _id: p._id,
                      project: p.project,
                    })
                  }
                >
                  {p.project}
                </Dropdown.Item>
              ))}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className="mb-3" drop={"left"}>
          <Dropdown.Toggle variant="warning" block>
            {selectedCategory ? selectedCategory.category : "Kategorie"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {categories
              .sort((a, b) => {
                return a.category < b.category ? -1 : a.category > b.category ? 1 : 0;
              })
              .map((c) => (
                <Dropdown.Item
                  key={c._id}
                  onSelect={() =>
                    setSelectedCategory({
                      _id: c._id,
                      category: c.category,
                    })
                  }
                >
                  {c.category}
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
            type="datetime-local"
            value={startTimeTmp}
            onChange={(e) => setStartTimeTmp(e.target.value)}
            onBlur={(e) => {
              setStartTime(moment(startTimeTmp).format("YYYY-MM-DDTkk:mm"));
            }}
          />
          <InputGroup.Text>
            <BsFillForwardFill />
          </InputGroup.Text>
          <FormControl
            onBlur={(e) => setEndTime(moment(endTimeTmp).format("YYYY-MM-DDTkk:mm"))}
            onChange={(e) => setEndTimeTmp(e.target.value)}
            value={endTimeTmp}
            placeholder="Bis"
            type="datetime-local"
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <FormControl
            onChange={(e) => setOptionalText(e.target.value)}
            value={optionalText}
            placeholder="Kommentar"
            aria-label="Kommentar"
            aria-describedby="basic-addon2"
            as="textarea"
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>Extern</InputGroup.Text>
          </InputGroup.Prepend>
          <InputGroup.Checkbox checked={!!isExternal} aria-label="Extern" onChange={() => setisExternal(!isExternal)} />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup aria-label="Basic example">
          <Button variant={isTracking ? "danger" : "secondary"} onClick={track}>
            {isTracking ? "Stop" : "Tracken"}
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Schließen
          </Button>
          <Button variant="secondary" onClick={reset}>
            Zurücksetzen
          </Button>
          <Button variant="warning" disabled={isDisabled} onClick={mode == "update" ? updateWorkentry : createWorkentry}>
            {mode == "update" ? "Aktualisieren" : "Speichern"}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
}
