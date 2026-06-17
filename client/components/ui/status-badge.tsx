export function StatusBadge({ isActive, archivedAt }: { isActive: boolean; archivedAt: string | null }) {
  if (archivedAt) {
    return <span className="badge badge-red">Archived</span>;
  }
  if (isActive) {
    return <span className="badge badge-green">Active</span>;
  }
  return <span className="badge badge-amber">Inactive</span>;
}
