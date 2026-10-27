import { CreateAccessGroupView } from "@/modules/roles/components/CreateAccessGroupView";

export const metadata = {
  title: "Create Access Group | Access Management",
  description: "Define a new access group with granular module and screen permissions.",
};

export default function CreateRolePage() {
  return <CreateAccessGroupView />;
}
