import { ComplaintsListView } from "@/components/ComplaintsListView";

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-teal-deep">Complaints</h1>
      </div>

      <ComplaintsListView
        params={params}
        basePath="/complaints"
        emptyTitle="No complaints yet"
        emptyDescription="Complaints submitted through the ShehriLink app will appear here."
      />
    </div>
  );
}
