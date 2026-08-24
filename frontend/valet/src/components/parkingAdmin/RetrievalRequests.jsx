import React, { useState } from "react";
import "./css/RetrievalRequests.css";

const initialRequests = [
  { id: 1, vehicleNo: "MH 12 AB 1234", customer: "John Doe", slot: "A-102", time: "12:40 PM", valet: "Alex Paul", status: "Requested" },
  { id: 2, vehicleNo: "MH 09 EF 9012", customer: "Michael Vance", slot: "C-301", time: "12:42 PM", valet: "Unassigned", status: "Requested" },
  { id: 3, vehicleNo: "MH 14 CD 5678", customer: "Sarah Smith", slot: "A-103", time: "12:30 PM", valet: "David Miller", status: "In Retrieval" },
];

const RetrievalRequests = () => {
  const [requests, setRequests] = useState(initialRequests);

  const updateStatus = (id, newStatus) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  return (
    <div className="retrievals-container">
      <div className="retrievals-header">
        <h2>Vehicle Retrieval Requests</h2>
        <p>Manage and transition live retrieval queues for waiting customers.</p>
      </div>

      <div className="table-card">
        <table className="retrieval-table">
          <thead>
            <tr>
              <th>Vehicle No</th>
              <th>Customer</th>
              <th>Slot</th>
              <th>Request Time</th>
              <th>Assigned Valet</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="font-bold">{r.vehicleNo}</td>
                <td>{r.customer}</td>
                <td><span className="slot-badge">{r.slot}</span></td>
                <td>{r.time}</td>
                <td>{r.valet}</td>
                <td><span className={`status-tag ${r.status.toLowerCase().replace(" ", "-")}`}>{r.status}</span></td>
                <td>
                  <div className="action-buttons">
                    {r.status === "Requested" && (
                      <button className="act-btn primary" onClick={() => updateStatus(r.id, "In Retrieval")}>Start Retrieval</button>
                    )}
                    {r.status === "In Retrieval" && (
                      <button className="act-btn amber" onClick={() => updateStatus(r.id, "Ready")}>Mark Ready</button>
                    )}
                    {r.status === "Ready" && (
                      <button className="act-btn success" onClick={() => updateStatus(r.id, "Completed")}>Complete Return</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetrievalRequests;