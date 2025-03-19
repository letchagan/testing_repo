import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [subscribers, setSubscribers] = useState([]);
  const [formData, setFormData] = useState({ imsi: "", key: "", opc: "", apn: "", staticIp: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await axios.get("http://192.168.206.146:5000/subscribers");
      setSubscribers(response.data);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if IMSI already exists in local state
    if (subscribers.some(sub => sub.imsi === formData.imsi)) {
      setError("❌ IMSI already exists!");
      return;
    }

    try {
      await axios.post("http://192.168.206.146:5000/subscribers", formData);
      fetchSubscribers();
      setFormData({ imsi: "", key: "", opc: "", apn: "", staticIp: "" });
    } catch (error) {
      setError(error.response?.data?.error || "Failed to add subscriber.");
    }
  };

  const deleteSubscriber = async (imsi) => {
    try {
      await axios.delete(`http://192.168.206.146:5000/subscribers/${imsi}`);
      fetchSubscribers();
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
    }
  };

  return (
    <div className="container">
      <h2>📡 Open5GS Subscriber Management</h2>

      {/* Form Section */}
      <div className="form-container">
        <h3>➕ Add New Subscriber</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="IMSI" value={formData.imsi} required onChange={(e) => setFormData({ ...formData, imsi: e.target.value })} />
          <input type="text" placeholder="Key" value={formData.key} required onChange={(e) => setFormData({ ...formData, key: e.target.value })} />
          <input type="text" placeholder="OPC" value={formData.opc} required onChange={(e) => setFormData({ ...formData, opc: e.target.value })} />
          <input type="text" placeholder="APN" value={formData.apn} required onChange={(e) => setFormData({ ...formData, apn: e.target.value })} />
          <input type="text" placeholder="Static IP" value={formData.staticIp} required onChange={(e) => setFormData({ ...formData, staticIp: e.target.value })} />
          <button type="submit">Add Subscriber</button>
        </form>
      </div>

      {/* Subscriber List */}
      <div className="list-container">
        <h3>📋 Subscriber List</h3>
        <table>
          <thead>
            <tr>
              <th>IMSI</th>
              <th>APN</th>
              <th>Static IP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub._id}>
                <td>{sub.imsi}</td>
                <td>{sub.apn}</td>
                <td>{sub.staticIp}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteSubscriber(sub.imsi)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
