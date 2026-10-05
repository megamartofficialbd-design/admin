import PendingVendors from "@/components/pages/admin/PendingVendors";

export const metadata = {
  title: "Pending Sellers | Bekolpo",
  description: "Review and manage pending seller applications in your Bekolpo admin panel.",
};

const page = () => {
  return <PendingVendors />;
};

export default page;
