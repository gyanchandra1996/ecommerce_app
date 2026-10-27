import { CreateAccessGroupView } from "@/modules/roles/components/CreateAccessGroupView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Access Group | Access Management",
  description: "Update access group permissions and module configurations.",
};

export default async function EditRolePage({ params }: PageProps) {
  const { id } = await params;
  return <CreateAccessGroupView roleId={id} />;
}
