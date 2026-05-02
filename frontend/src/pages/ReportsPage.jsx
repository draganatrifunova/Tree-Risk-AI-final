export default function ReportsPage() {
  const download = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"}/reports/generate`, "_blank");
  };

  return (
    <div className="card max-w-xl space-y-3">
      <h2 className="text-xl font-semibold">Reports</h2>
      <p>Generate PDF with statistics, high risk trees, and recommendations.</p>
      <button className="bg-primary text-white rounded px-4 py-2" onClick={download}>
        Generate PDF Report
      </button>
    </div>
  );
}
