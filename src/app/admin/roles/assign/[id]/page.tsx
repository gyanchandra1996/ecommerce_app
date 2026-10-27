import { ManageEmployeeRolesView } from "@/modules/roles/components/ManageEmployeeRolesView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Manage Customer Access & Roles | Access Management",
  description: "Configure role permissions and screen privileges for a customer account.",
};

export default async function ManageEmployeeRolesPage({ params }: PageProps) {
  const { id } = await params;
  return <ManageEmployeeRolesView employeeId={id} />;
}
