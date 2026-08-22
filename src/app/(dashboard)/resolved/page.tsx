import { ComplaintsListView } from "@/components/ComplaintsListView";

export default async function ResolvedComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-teal-deep">Resolved</h1>
      </div>

      <ComplaintsListView
        params={params}
        basePath="/resolved"
        lockedStatus="resolved"
        emptyTitle="No resolved complaints yet"
        emptyDescription="Complaints marked resolved will show up here."
      />
    </div>
  );
}
