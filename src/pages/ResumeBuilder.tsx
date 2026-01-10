import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ResumeBuilder = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    education: "",
    experience: "",
    skills: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadPDF = async () => {
    if (resumeRef.current) {
      const canvas = await html2canvas(resumeRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.name || "resume"}.pdf`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Form Section */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Resume Builder</h2>
        {[
          { label: "Full Name", name: "name" },
          { label: "Email", name: "email" },
          { label: "Phone", name: "phone" },
          { label: "Professional Summary", name: "summary", type: "textarea" },
          { label: "Education", name: "education", type: "textarea" },
          { label: "Experience", name: "experience", type: "textarea" },
          { label: "Skills", name: "skills", type: "textarea" },
        ].map((field) => (
          <div key={field.name} className="mb-3">
            <label className="block font-semibold mb-1">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={field.name === "summary" ? 4 : 3}
              />
            ) : (
              <input
                type="text"
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
        <button
          onClick={downloadPDF}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      </div>

      {/* Preview Section */}
      <div className="flex-1 p-6 bg-gray-100 rounded-lg shadow-md overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Preview</h2>
        <div
          ref={resumeRef}
          className="p-6 bg-white text-black font-sans shadow border min-h-[500px]"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">{formData.name || "Your Name"}</h1>
            <p>{formData.email || "email@example.com"} | {formData.phone || "123-456-7890"}</p>
          </div>

          {/* Professional Summary */}
          {formData.summary && (
            <div className="mb-3">
              <h2 className="font-semibold text-lg border-b pb-1">Professional Summary</h2>
              <p>{formData.summary}</p>
            </div>
          )}

          {/* Education */}
          {formData.education && (
            <div className="mb-3">
              <h2 className="font-semibold text-lg border-b pb-1">Education</h2>
              <p>{formData.education}</p>
            </div>
          )}

          {/* Work Experience */}
          {formData.experience && (
            <div className="mb-3">
              <h2 className="font-semibold text-lg border-b pb-1">Experience</h2>
              <p>{formData.experience}</p>
            </div>
          )}

          {/* Skills */}
          {formData.skills && (
            <div className="mb-3">
              <h2 className="font-semibold text-lg border-b pb-1">Skills</h2>
              <p>{formData.skills}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
