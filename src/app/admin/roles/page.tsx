import { AccessRolesMasterView } from "@/modules/roles/components/AccessRolesMasterView";

export const metadata = {
  title: "Access Management & Roles | Admin",
  description: "Configure system roles, page permissions and employee access groups.",
};

export default function RolesMasterPage() {
  return <AccessRolesMasterView />;
}
