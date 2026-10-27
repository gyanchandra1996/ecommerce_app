import { AllSettingsView } from "@/modules/settings/components/AllSettingsView";

export const metadata = {
  title: "All Settings | Admin",
  description: "Configure storefront theme branding, dynamic footer links and arrangement, social media channels, and store engine settings.",
};

export default function SettingsPage() {
  return <AllSettingsView />;
}
