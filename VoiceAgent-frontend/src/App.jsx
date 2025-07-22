import React, { useState, useRef } from "react";
import HomeLoanForm from "./HomeLoanForm";

function App() {
  const [formData, setFormData] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" });
      const file = new File([blob], "audio.wav");

      const formData = new FormData();
      formData.append("audio", file);

      try {
        const res = await fetch("http://localhost:8000/api/transcribe/", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data?.fields) {
          setFormData(data.fields);
        } else {
          alert("❌ No form fields extracted.");
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">🏡 Home Loan Agent (Voice To FillForm)</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          🎤 Please describe your home loan request including:
          your <strong>name</strong>, <strong>Dob</strong>, <strong>loan amount</strong>, <strong>tenure</strong>, <strong>monthly income</strong>, and <strong>location</strong>.
        </p>
        <p className="text-xs text-gray-500 italic mt-1">
          Example: "Hi, I’m Naveen Prasath. I want a home loan of 40 lakhs for 15 years.
          My monthly income is 60,000 and I live in Chennai."
        </p>
      </div>
      
      {recording ? (
        <button
          onClick={stopRecording}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          ⏹ Stop Recording
        </button>
      ) : (
        <button
          onClick={startRecording}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🎤 Start Recording
        </button>
      )}

      {formData && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">📝 Auto-filled Form</h2>
          <HomeLoanForm extracted={formData} />
        </div>
      )}
    </div>
  );
}

export default App;
