import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import moment from "moment";
import axios from "axios";
import { useAlert } from "react-alert";
import { ipcRenderer } from "electron";
import { BsFillForwardFill, BsFillClockFill } from "react-icons/bs";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
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
    ipcRenderer.send("workentrycreate:new", newWorkentryState);
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

  async function updateWorkentry() {
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
    try {
      let newWorkentry = {
        project: selectedProject._id,
        category: selectedCategory._id,
        fromDate: startTime,
        untilDate: endTime,
        optionalText: optionalText || "",
      };
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
        <Dropdown className="mb-3 ">
          <Dropdown.Toggle variant="warning" className="" block>
            {selectedProject ? selectedProject.project : "Projekt"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {projects.map((p) => (
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

        <Dropdown className="mb-3">
          <Dropdown.Toggle variant="warning" block>
            {selectedCategory ? selectedCategory.category : "Kategorie"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {categories.map((c) => (
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
            type="time"
            value={startTimeTmp}
            onChange={(e) => setStartTimeTmp(e.target.value)}
            onBlur={(e) => {
              setStartTime(moment(startTimeTmp, "HH:mm").format("HH:mm"));
            }}
          />
          <InputGroup.Text>
            <BsFillForwardFill />
          </InputGroup.Text>
          <FormControl
            onBlur={(e) => setEndTime(moment(endTimeTmp, "HH:mm").format("HH:mm"))}
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
        <Button variant={isTracking ? "danger" : "secondary"} onClick={track}>
          {isTracking ? "Stop" : "Track"}
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Schließen
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
        <Button variant="warning" disabled={isDisabled} onClick={mode == "update" ? updateWorkentry : createWorkentry}>
          {mode == "update" ? "Aktualisieren" : "Speichern"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
