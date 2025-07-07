import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import "./App.css";

const timeSlots = [
  "8-9", "9-10", "10-11", "11-12", "12-1",
  "1-2", "2-3", "3-4", "4-5", "5-6"
];

const slotToRoom = {
  "8-9": "ROOM1",
  "9-10": "ROOM2",
  "10-11": "ROOM3",
  "11-12": "ROOM3",
  "12-1": "ROOM4",
  "1-2": "ROOM4",
  "2-3": "ROOM5",
  "3-4": "ROOM6",
  "4-5": "ROOM7",
  "5-6": null
};

const dayOptions = ["All Days", "MON", "TUE", "WED", "THU", "FRI"];

function App() {
  const [timetable, setTimetable] = useState([]);
  const [section, setSection] = useState("CSE-4");
  const [dayFilter, setDayFilter] = useState("All Days");
  const [filtered, setFiltered] = useState([]);
  const [view, setView] = useState("full");
  const tableRef = useRef(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/timetable")
      .then((res) => {
        const cleaned = res.data.filter(
          row => row.Section !== "Section" && row.Section !== undefined
        );
        setTimetable(cleaned);
      })
      .catch((err) => console.error("Error loading timetable", err));
  }, []);

  const handleSearch = () => {
    let result = timetable.filter(
      row => row.Section.toLowerCase() === section.toLowerCase()
    );

    if (dayFilter !== "All Days") {
      result = result.filter(row => row.DAY === dayFilter);
    }

    setFiltered(result);
  };

  useEffect(() => {
    handleSearch();
  }, [dayFilter]);

  const todayShort = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date().getDay()];


 const handleExport = () => {
  const tableWrapper = tableRef.current;
  if (!tableWrapper) return;

  // Clone the node
  const clone = tableWrapper.cloneNode(true);

  // Apply styles to fully expand content
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.width = "fit-content";
  clone.style.height = "fit-content";
  clone.style.overflow = "visible";
  clone.style.maxHeight = "none";
  clone.style.maxWidth = "none";
  clone.style.zIndex = "-9999";
  clone.style.background = "#283d4b";
  clone.style.padding = "1rem";

  // Append to body
  document.body.appendChild(clone);

  // Wait a moment to ensure DOM is ready
  setTimeout(() => {
    html2canvas(clone, {
      scrollX: 0,
      scrollY: 0,
      scale: 2,
      useCORS: true
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "timetable.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      document.body.removeChild(clone);
    });
  }, 100);
};


  return (
    <div className="app-container d-flex flex-column align-items-center justify-content-center">
      <div className="timetable-card">
        <div className="search-header">
          <h2 className="text-center mb-2">7<sup>th</sup> Semester Weekly Timetable</h2>
          <p className="note text-center text-light mb-3" style={{ fontSize: "0.9rem", color: "#a0aabf" }}>
            <strong>NOTE:</strong> Designed for <strong>7th Semester CSE/IT/CSCE/CSSE and RES-1</strong> students.
          </p>

          <div className="row mb-2">
            <div className="col-md-12 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Section (e.g. CSE-1)"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>
            <div className="col-md-12 mb-2 text-center">
              <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            </div>
          </div>

          <div className="row mb-3" style={{ marginTop: "2rem" }}>
            <div className="col-md-4 mb-2">
              <select
                className="form-select"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
              >
                {dayOptions.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-2 d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => setView("full")}
              >
                Full Week
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setView("today")}
              >
                Highlight Today
              </button>
            </div>
            <div className="col-md-4 mb-2 text-end">
              <button className="btn btn-success" onClick={handleExport}>
                Export as Image
              </button>
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="table-responsive" ref={tableRef}>
            <table className="table table-bordered text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Day</th>
                  {timeSlots.map((slot, i) => (
                    <th key={i}>{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => {
                  const isToday = row.DAY === todayShort;
                  return (
                    <tr
                      key={idx}
                      className={view === "today" && isToday ? "table-warning" : ""}
                    >
                      <td><strong>{row.DAY}</strong></td>
                      {timeSlots.map((slot, i) => {
                        const subject = row[slot];
                        const roomKey = slotToRoom[slot];
                        const room = roomKey ? row[roomKey] : null;
                        const isFree = subject === "X";

                        return (
                          <td key={i}>
                            {isFree ? (
                              <span style={{ fontSize: "1.2rem", color: "#bbb" }}>X</span>
                            ) : (
                              <>
                                <strong>{subject}</strong><br />
                                <small className="text-muted">{room && room !== "---" ? room : "Room N/A"}</small>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          section && (
            <div className="text-center text-danger mt-3" style={{fontSize: "1.2rem",color: "#ddd" , marginTop: "2rem"}}>
              No timetable found for section "<strong>{section}</strong>"
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
