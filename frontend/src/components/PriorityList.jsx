export default function PriorityList({ trees = [] }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">High Risk Priority</h3>
      <div className="space-y-2">
        {trees.map((tree) => (
          <div key={tree.id} className="flex justify-between text-sm">
            <span>{tree.species}</span>
            <span className="text-danger font-medium">{Math.round(tree.risk_score)}</span>
          </div>
        ))}
        {!trees.length && <p className="text-sm text-gray-500">No high-risk trees found.</p>}
      </div>
    </div>
  );
}
