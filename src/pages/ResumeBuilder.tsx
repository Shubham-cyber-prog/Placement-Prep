import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    projects: "",
  });

  const resumeRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;

    const canvas = await html2canvas(resumeRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("My_Resume.pdf");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
      
      {/* FORM */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Resume Builder</h1>

        <div className="grid gap-3">
          <input name="name" placeholder="Full Name" className="border p-2" onChange={handleChange} />
          <input name="email" placeholder="Email" className="border p-2" onChange={handleChange} />
          <input name="phone" placeholder="Phone" className="border p-2" onChange={handleChange} />
          <textarea name="skills" placeholder="Skills" className="border p-2" onChange={handleChange} />
          <textarea name="education" placeholder="Education" className="border p-2" onChange={handleChange} />
          <textarea name="projects" placeholder="Projects" className="border p-2" onChange={handleChange} />
        </div>

        <button
          onClick={downloadPDF}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* PREVIEW */}
      <div ref={resumeRef} className="border p-6 bg-white">
        <h2 className="text-xl font-bold">{form.name}</h2>
        <p>{form.email} | {form.phone}</p>

        <hr className="my-2" />

        <p><b>Skills:</b> {form.skills}</p>
        <p><b>Education:</b> {form.education}</p>
        <p><b>Projects:</b> {form.projects}</p>
      </div>
    </div>
  );
}
