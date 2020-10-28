import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import Table from "react-bootstrap/Table";
import moment from "moment";
import axios from "axios";

export default function Workentry({ workentries }) {
    // let url = "http://localhost:8080/api/v1/workentry";
    let [localWorkentries, setLocalWorkentries] = useState([]);

    // useEffect(() => {
    //     ipcRenderer.send("workentries:load");
    //     ipcRenderer.on("workentries:get", (e, w) => {
    //         setWorkentries(JSON.parse(w));
    //     });
    // }, [url]);

    useEffect(() => {
        setLocalWorkentries(
            [...localWorkentries, ...workentries].filter(
                (item, pos, self) => self.indexOf(item) == pos
            )
        );
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
                </tr>
            </thead>
            <tbody>
                {localWorkentries.map((w) => (
                    <tr key={w.id}>
                        <td>{w.id.substring(0, 8)}</td>
                        <td>{w.projectName}</td>
                        <td>{w.categoryName}</td>
                        <td>{w.optionalText}</td>
                        <td>{w.fromDate}</td>
                        <td>{w.untilDate}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
