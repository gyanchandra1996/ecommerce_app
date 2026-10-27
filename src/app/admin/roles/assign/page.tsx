import { AssignEmployeeRolesView } from "@/modules/roles/components/AssignEmployeeRolesView";

export const metadata = {
  title: "Assign Customer Role | Access Management",
  description: "Assign custom security roles and access groups to customer accounts.",
};

export default function AssignRolesPage() {
  return <AssignEmployeeRolesView />;
}
