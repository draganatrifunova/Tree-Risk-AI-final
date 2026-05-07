import api from "../services/api.js";

export default function ReportsPage() {
    const download = async () => {
        const res = await api.get("/reports/generate/", {
            responseType: "blob"
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "tree-risk-report.pdf");
        document.body.appendChild(link);
        link.click();
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
