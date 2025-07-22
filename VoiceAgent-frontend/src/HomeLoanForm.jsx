import React, { useState, useEffect } from "react";

const defaultState = {
  name: "",
  dob:"",
  loan_amount: "",
  tenure_years: "",
  monthly_income: "",
  location: ""
};

export default function HomeLoanForm({ extracted }) {
  const [form, setForm] = useState(defaultState);

  useEffect(() => {
    if (extracted) setForm(extracted);
  }, [extracted]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📤 Submitting:", form);
    alert("✅ Form submitted successfully!");
    // You can POST this form to a backend here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {Object.entries(form).map(([key, value]) => (
        <div key={key}>
          <label className="block font-medium capitalize">{key.replace("_", " ")}:</label>
          <input
            className="w-full border rounded px-3 py-2"
            name={key}
            value={value}
            onChange={handleChange}
          />
        </div>
      ))}

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        Submit
      </button>
    </form>
  );
}
