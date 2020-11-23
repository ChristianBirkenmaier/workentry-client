import React, { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import axios from "axios";
import { BsFillTrashFill, BsGear } from "react-icons/bs";
import Button from "react-bootstrap/Button";
import { useAlert } from "react-alert";

import { PROD_WORKENTRY_API, DEV_WORKENTRY_API } from "../config/api.json";

export default function WorkentryList({ workentries, isDev, handleUpdate }) {
  let [localWorkentries, setLocalWorkentries] = useState([]);
  const [projectUrl, setProjectUrl] = useState(isDev ? DEV_WORKENTRY_API : PROD_WORKENTRY_API);

  let alert = useAlert();
  useEffect(() => {
    setProjectUrl(isDev ? DEV_WORKENTRY_API : PROD_WORKENTRY_API);
  }, [isDev]);

  useEffect(() => {
    setLocalWorkentries(workentries);
  }, [workentries]);

  async function deleteWorkentry(_id) {
    try {
      await axios.delete(`${projectUrl}/${_id}`);
      let filteredWorkentries = localWorkentries.filter((l) => l._id != _id);
      setLocalWorkentries(filteredWorkentries);
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
    <Container fluid className="data-container">
      <Row className="data-header align-items-center" id="main-row">
        <Col sm={1}>ID</Col>
        <Col sm={2}>Projekt</Col>
        <Col sm={2}>Kategorie</Col>
        <Col sm={2}>Kommentar</Col>
        <Col sm={2}>Von - Bis</Col>
        <Col sm={1}>Dauer</Col>
        <Col sm={2}></Col>
      </Row>
      {workentries.map((w) => (
        <Row key={w._id} className="align-items-center">
          <Col sm={1}>{w._id.substring(0, 8)}...</Col>
          <Col sm={2}>{w.category ? w.category.category : "Unbekannte Kategorie"}</Col>
          <Col sm={2}>{w.project ? w.project.project : "Unbekanntes Projekt"}</Col>
          <Col sm={2}>{w.optionalText}</Col>
          <Col sm={2}>
            {w.fromDate} - {w.untilDate}
          </Col>
          <Col sm={1}> {calculateDuration(w.fromDate, w.untilDate)}</Col>
          <Col sm={2}>
            <Button variant="danger" onClick={() => deleteWorkentry(w._id)}>
              <BsFillTrashFill />
            </Button>
            <Button onClick={() => handleUpdate(w)} variant="warning">
              <BsGear />
            </Button>
          </Col>
        </Row>
      ))}
    </Container>
  );
}
