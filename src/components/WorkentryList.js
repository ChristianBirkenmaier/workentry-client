import React, { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import axios from "axios";
import { BsFillTrashFill, BsGear } from "react-icons/bs";
import Button from "react-bootstrap/Button";
import { useAlert } from "react-alert";
import moment from "moment";

import { PROD_WORKENTRY_API, DEV_WORKENTRY_API } from "../config/api.json";

const checkIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-check" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"
    />
  </svg>
);

export default function WorkentryList({ workentries, setWorkentries, isDev, handleUpdate }) {
  const [projectUrl, setProjectUrl] = useState(isDev ? DEV_WORKENTRY_API : PROD_WORKENTRY_API);

  let alert = useAlert();
  useEffect(() => {
    setProjectUrl(isDev ? DEV_WORKENTRY_API : PROD_WORKENTRY_API);
  }, [isDev]);

  async function deleteWorkentry(_id) {
    try {
      await axios.delete(`${projectUrl}/${_id}`);
      workentries = workentries.filter((l) => l._id != _id);
      setWorkentries(workentries);
      alert.show(`Zeiteintrag erfolgreich gelöscht`);
    } catch (err) {
      console.error("Error:", err);
      setLocalWorkentries([]);
      alert.show("Fehler beim Löschen des Zeiteintrags");
    }
  }

  function calculateDuration(t1, t2) {
    let [hours, minutes] = t1.split(":");
    let [hours2, minutes2] = t2.split(":");
    hours = hours * 60;
    let time1 = Number(hours) + Number(minutes);
    hours2 = hours2 * 60;
    let time2 = Number(hours2) + Number(minutes2);
    let duration = time2 - time1;
    let durationHours = Math.floor(duration / 60);
    let durationMinutes = duration % 60;
    durationMinutes = durationMinutes.toString().length < 2 ? `0${durationMinutes}` : durationMinutes;
    return `${durationHours}:${durationMinutes} h`;
  }

  return (
    <Container fluid className="data-container text-center">
      <Row className="data-header align-items-center" id="main-row">
        <Col sm={2}>Projekt</Col>
        <Col sm={2}>Kategorie</Col>
        <Col sm={2}>Kommentar</Col>
        <Col sm={1}>Datum</Col>
        <Col sm={1}>Von</Col>
        <Col sm={1}>Bis</Col>
        <Col sm={1}>Dauer</Col>
        <Col sm={1}>Extern</Col>
        <Col sm={1}></Col>
      </Row>
      {workentries.map((w) => (
        <Row key={w._id} className="align-items-center">
          <Col sm={2}>{w.category ? w.category.category : "Unbekannte Kategorie"}</Col>
          <Col sm={2}>{w.project ? w.project.project : "Unbekanntes Projekt"}</Col>
          <Col sm={2}>{w.optionalText}</Col>
          <Col sm={1}>{w.date.replaceAll("-", ".")}</Col>
          <Col sm={1}>{w.start}</Col>
          <Col sm={1}>{w.end}</Col>
          <Col sm={1}> {calculateDuration(w.start, w.end)}</Col>
          <Col sm={1}> {w.external ? checkIcon() : ""}</Col>
          <Col sm={1}>
            <Button variant="danger" onClick={() => deleteWorkentry(w._id)}>
              <BsFillTrashFill />
            </Button>
            <Button onClick={() => handleUpdate(w)} variant="dark">
              <BsGear />
            </Button>
          </Col>
        </Row>
      ))}
    </Container>
  );
}
