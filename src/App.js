import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [downloadLink, setDownloadLink] = useState('');

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setIsLoggedIn(true);
  }
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileSubmit = async (event) => {
    event.preventDefault();

  
    if (!selectedFile) {
      setUploadStatus("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      
      setUploadStatus(`File uploaded successfully! File ID: ${response.data.fileId}`);
      setDownloadLink(`http://localhost:5000/download/${response.data.fileId}`);
    } catch (error) {
      console.error("Error uploading file", error);
      setUploadStatus('Failed to upload file');
    }
  };

  if (!isLoggedIn) {
    return (
      
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLoginSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="upload-container">
        <h2>Upload a File</h2>
        <form onSubmit={handleFileSubmit}>
          <label htmlFor="file">Choose File</label>
          <input type="file" id="file" onChange={handleFileChange} />
          <button type="submit">Upload</button>
        </form>
        {uploadStatus && <p>{uploadStatus}</p>}
        {downloadLink && <p><a href={downloadLink} target="_blank" rel="noopener noreferrer">Download the file</a></p>}
      </div>
    </div>
  );
}

export default App;
