const LABELS = {
  LOW: "Низок ризик",
  MEDIUM: "Среден ризик",
  HIGH: "Висок ризик",
};

function badgeClass(risk) {
  if (risk === "HIGH") return "bg-red-100 text-red-600";
  if (risk === "MEDIUM") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-600";
}

function recommendation(risk) {
  if (risk === "HIGH") return "Итна интервенција";
  if (risk === "MEDIUM") return "Планирана проверка";
  return "Рутинско одржување";
}

export default function PriorityList({ trees = [] }) {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          Приоритетна листа - Најризични дрва
        </h3>
        <a href="/trees" className="text-sm border rounded px-3 py-1">
          Види сè →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">ID</th>
              <th className="text-left py-2">Вид</th>
              <th className="text-left py-2">Здравствена состојба</th>
              <th className="text-left py-2">Оцена на ризик</th>
              <th className="text-left py-2">Препорака</th>
              <th className="text-left py-2">Детали</th>
            </tr>
          </thead>

          <tbody>
            {trees.map((tree) => (
              <tr key={tree.id} className="border-b last:border-0">
                <td className="py-3 font-semibold">#{tree.id}</td>
                <td>{tree.species}</td>
                <td>{tree.health_condition}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full font-semibold ${badgeClass(
                      tree.risk_category
                    )}`}
                  >
                    {Math.round(tree.risk_score)}
                  </span>
                </td>
                <td
                  className={
                    tree.risk_category === "HIGH"
                      ? "text-red-600 font-semibold"
                      : "text-yellow-600 font-semibold"
                  }
                >
                  {recommendation(tree.risk_category)}
                </td>
                <td>
                  <a href="/trees" className="font-semibold">
                    Детали
                  </a>
                </td>
              </tr>
            ))}

            {!trees.length && (
              <tr>
                <td colSpan="6" className="py-4 text-gray-500">
                  Нема внесени дрва.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}