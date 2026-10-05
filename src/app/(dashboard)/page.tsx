"use client";

import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import VendorDashboard from "@/components/dashboard/VendorDashboard";
import { ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    if (currentUser.role === "customer") {
      router.push("/auth/login");
      return;
    }


    setLoading(false);
  }, [currentUser, pathname, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-pulse text-gray-500 text-lg font-medium">
          Loading...
        </div>
      </div>
    );

  if (currentUser?.role === "admin") return <AdminDashboard />;
  if (currentUser?.role === "vendor") return <VendorDashboard />;

  // Fallback unauthorized UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-gray-500 mb-6">
          You don’t have permission to access this page.  
          Please log in with an admin or seller account.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
 