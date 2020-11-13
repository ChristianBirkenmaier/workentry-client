import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import Table from "react-bootstrap/Table";
import moment from "moment";
import axios from "axios";
import { BsFillTrashFill, BsGear } from "react-icons/bs";
import Button from "react-bootstrap/Button";
import { useAlert } from "react-alert";

import { PROD_WORKENTRY_API, DEV_WORKENTRY_API } from "../config/api.json";

export default function WorkentryList({ workentries, isDev, handleUpdate }) {
  // let url = "http://localhost:8080/api/v1/workentry";
  let [localWorkentries, setLocalWorkentries] = useState([]);
  let alert = useAlert();

  // useEffect(() => {
  //     ipcRenderer.send("workentries:load");
  //     ipcRenderer.on("workentries:get", (e, w) => {
  //         setWorkentries(JSON.parse(w));
  //     });
  // }, [url]);

  useEffect(() => {
    // console.log("localWorkentries: ", localWorkentries);
    // let filteredItems = workentries.filter((item, pos, self) => self.indexOf(item) == pos);
    // let filteredItems = workentries.filter((item, pos, self) => self.indexOf(item) == pos);
    // console.log(filteredItems);
    setLocalWorkentries(workentries);
  }, [workentries]);

  // function fetchData() {
  //     try {
  //         console.log(`Fetching from ${url}`);
  //         let workentries = axios.get(url).then((we) => {
  //             console.dir(`Successfully fetched, data recieved: ${JSON.stringify(workentries)}`);
  //             return setWorkentries(workentries);
  //         });
  //     } catch (err) {
  //         console.error(err);
  //     }
  // }

  async function deleteWorkentry(_id) {
    try {
      await axios.delete(isDev ? `${DEV_WORKENTRY_API}/${_id}` : `${PROD_WORKENTRY_API}/${_id}`);
      let filteredWorkentries = localWorkentries.filter((l) => l._id != _id);
      setLocalWorkentries(filteredWorkentries);
      alert.show(`Zeiteintrag erfolgreich gelöscht`);
    } catch (err) {
      console.error("Error:", err);
      alert.show("Fehler beim Löschen des Zeiteintrags");
    }
  }

  return (
    <Table striped bordered hover variant="light" size="sm" style={{ tableLayout: "fixed" }}>
      <thead>
        <tr>
          <th>#</th>
          <th>Project</th>
          <th>Category</th>
          <th>Optional</th>
          <th>Start</th>
          <th>End</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {localWorkentries.map((w) => (
          <tr key={w._id}>
            <td>{w._id.substring(0, 8)}</td>
            <td>{w.project.project}</td>
            <td>{w.category.category}</td>
            <td>{w.optionalText}</td>
            <td>{w.fromDate}</td>
            <td>{w.untilDate}</td>
            <td>
              <Button>
                <BsGear onClick={() => handleUpdate(w)} />
              </Button>
            </td>
            <td>
              <Button>
                <BsFillTrashFill onClick={() => deleteWorkentry(w._id)} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
