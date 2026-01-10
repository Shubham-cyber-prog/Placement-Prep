import { useState } from "react";

export default function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    projects: "",
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resume Builder</h1>

      <div className="grid gap-3">
        <input placeholder="Full Name" className="border p-2"
          onChange={e => setForm({ ...form, name: e.target.value })} />

        <input placeholder="Email" className="border p-2"
          onChange={e => setForm({ ...form, email: e.target.value })} />

        <input placeholder="Phone" className="border p-2"
          onChange={e => setForm({ ...form, phone: e.target.value })} />

        <textarea placeholder="Skills" className="border p-2"
          onChange={e => setForm({ ...form, skills: e.target.value })} />

        <textarea placeholder="Education" className="border p-2"
          onChange={e => setForm({ ...form, education: e.target.value })} />

        <textarea placeholder="Projects" className="border p-2"
          onChange={e => setForm({ ...form, projects: e.target.value })} />
      </div>

      <h2 className="text-xl font-semibold mt-6">Preview</h2>

      <div className="border p-4 mt-2 bg-gray-50">
        <h3 className="text-lg font-bold">{form.name}</h3>
        <p>{form.email} | {form.phone}</p>
        <p><b>Skills:</b> {form.skills}</p>
        <p><b>Education:</b> {form.education}</p>
        <p><b>Projects:</b> {form.projects}</p>
      </div>
    </div>
  );
}
