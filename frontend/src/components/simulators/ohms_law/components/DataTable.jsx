import React from "react";

const DataTable = ({ measurements }) => {
  return (
    <div className="data-table-container">
      <h2>Measurements</h2>
      
      {measurements.length === 0 ? (
        <p className="no-data-message">
          No measurements recorded yet. Click "Record Measurement" to add data.
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Voltage (V)</th>
              <th>Resistance (Ω)</th>
              <th>Current (A)</th>
              <th>Power (W)</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((measurement) => (
              <tr key={measurement.id}>
                <td>{measurement.timestamp}</td>
                <td>{measurement.voltage.toFixed(1)}</td>
                <td>{measurement.resistance}</td>
                <td>{measurement.current.toFixed(3)}</td>
                <td>{measurement.power.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DataTable;