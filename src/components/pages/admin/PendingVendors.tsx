"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Search, CheckCircle, Clock, X, Building, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/modules/Dashboard/pending-vendors/pending-card";
import { useGetVendorsQuery, useUpdateVendorStatusMutation } from "@/redux/featured/vendor/vendorApi";
import { IVendor } from "@/types/vendor";
import toast from "react-hot-toast";

export default function PendingVendors() {
  const { data: vendors = [], refetch, isLoading } = useGetVendorsQuery();
  const [updateVendorStatus] = useUpdateVendorStatusMutation();
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);

  // Filter only pending vendors
  const pendingVendors = vendors.filter((v: IVendor) => {
    const st = (v.status || v.userId?.status || "pending").toLowerCase();
    const isPending = st === "pending";
    const name = v.userId?.name || "";
    const email = v.userId?.email || "";
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    return isPending && matchesSearch;
  });

  const handleApprove = async (id: string, name?: string) => {
    try {
      await updateVendorStatus({ id, status: "approved" }).unwrap();
      toast.success(`${name || "Seller"} approved successfully!`);
      if (selectedVendor?._id === id) {
        setSelectedVendor(null);
      }
      refetch();
    } catch (err) {
      toast.error("Failed to approve seller.");
      console.error(err);
    }
  };

  const handleReject = async (id: string, name?: string) => {
    try {
      await updateVendorStatus({ id, status: "rejected" }).unwrap();
      toast.success(`${name || "Seller"} rejected.`);
      if (selectedVendor?._id === id) {
        setSelectedVendor(null);
      }
      refetch();
    } catch (err) {
      toast.error("Failed to reject seller.");
      console.error(err);
    }
  };

  const totalVendors = vendors.length;
  const approvedCount = vendors.filter(
    (v: IVendor) =>
      v.status === "approved" ||
      v.status === "Active" ||
      v.userId?.status === "Active"
  ).length;

  return (
    <div className="p-4 space-y-6 py-6 w-full">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Applications"
          value={String(pendingVendors.length)}
          subtitle="Waiting for admin review"
        />
        <StatCard
          title="Approved Sellers"
          value={String(approvedCount)}
          subtitle="Fully active in platform"
        />
        <StatCard
          title="Total Registrations"
          value={String(totalVendors)}
          subtitle="All registered sellers"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pending sellers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg p-4 w-full bg-white dark:bg-background">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#1B1F32] flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Seller Approval Requests ({pendingVendors.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading pending sellers...
          </div>
        ) : pendingVendors.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-semibold text-gray-700">No pending seller applications</p>
            <p className="text-xs text-gray-400">All seller requests have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller / Store</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Submitted Details</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVendors.map((vendor: IVendor) => {
                  const name = vendor.userId?.name || "Seller";
                  const email = vendor.userId?.email || "N/A";
                  const phone = vendor.userId?.contactNo || "N/A";
                  const ob = vendor.onboarding;
                  const sellerType = ob?.idInfo?.sellerType || "Individual";
                  const docType = ob?.idInfo?.idType || "Govt ID";
                  const docNumber = ob?.idInfo?.idNumber;
                  const bankName = ob?.bankDetails?.bankName;

                  return (
                    <TableRow key={vendor._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold uppercase">
                            {name.slice(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: #{vendor._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        <div className="font-medium text-gray-800">{email}</div>
                        <div>{phone}</div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
                          {sellerType}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-foreground">
                        {vendor.createdAt
                          ? new Date(vendor.createdAt).toLocaleDateString()
                          : "Today"}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium inline-block mr-1">
                            {docType}: {docNumber || "Uploaded"}
                          </span>
                          {bankName && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium inline-block">
                              {bankName}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {/* View details */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedVendor(vendor)}
                            className="h-8 px-2.5 text-xs text-gray-700 border border-gray-200 hover:bg-gray-100"
                            title="View submitted documents & details"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>

                          {/* Quick Approve */}
                          <Button
                            size="sm"
                            onClick={() => handleApprove(vendor._id, name)}
                            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            title="Approve Seller"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>

                          {/* Quick Reject */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(vendor._id, name)}
                            className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            title="Reject Seller"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Seller Application Review
                </h3>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seller profile overview */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <div className="text-sm font-bold text-gray-800">
                {selectedVendor.userId?.name || "Seller"}
              </div>
              <div className="text-xs text-gray-500">
                Email: {selectedVendor.userId?.email} | Phone: {selectedVendor.userId?.contactNo}
              </div>
            </div>

            {/* Warehouse Address */}
            <div className="p-3.5 border rounded-xl space-y-2">
              <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#009ac7]" />
                Warehouse Address
              </div>
              {selectedVendor.onboarding?.warehouseAddress ? (
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>
                    <span className="font-semibold text-gray-700">Division:</span>{" "}
                    {selectedVendor.onboarding.warehouseAddress.division || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">City / District:</span>{" "}
                    {selectedVendor.onboarding.warehouseAddress.city || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Thana / Area:</span>{" "}
                    {selectedVendor.onboarding.warehouseAddress.thana || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Postal Code:</span>{" "}
                    {selectedVendor.onboarding.warehouseAddress.postalCode || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Address:</span>{" "}
                    {selectedVendor.onboarding.warehouseAddress.address || "N/A"}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No warehouse address provided yet.</p>
              )}
            </div>

            {/* ID Information */}
            <div className="p-3.5 border rounded-xl space-y-2">
              <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#009ac7]" />
                Government ID & Business Document
              </div>
              {selectedVendor.onboarding?.idInfo ? (
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>
                    <span className="font-semibold text-gray-700">Seller Type:</span>{" "}
                    <span className="capitalize">{selectedVendor.onboarding.idInfo.sellerType || "Individual"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Document Type:</span>{" "}
                    {selectedVendor.onboarding.idInfo.idType}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Document Number:</span>{" "}
                    <span className="font-mono font-medium text-gray-900">
                      {selectedVendor.onboarding.idInfo.idNumber}
                    </span>
                  </p>
                  {selectedVendor.onboarding.idInfo.frontPartName && (
                    <p>
                      <span className="font-semibold text-gray-700">Front Part:</span>{" "}
                      {selectedVendor.onboarding.idInfo.frontPartName}
                    </p>
                  )}
                  {selectedVendor.onboarding.idInfo.backPartName && (
                    <p>
                      <span className="font-semibold text-gray-700">Back Part:</span>{" "}
                      {selectedVendor.onboarding.idInfo.backPartName}
                    </p>
                  )}
                  {selectedVendor.onboarding.idInfo.singleDocName && (
                    <p>
                      <span className="font-semibold text-gray-700">Document Copy:</span>{" "}
                      {selectedVendor.onboarding.idInfo.singleDocName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No identification submitted yet.</p>
              )}
            </div>

            {/* Bank Details */}
            <div className="p-3.5 border rounded-xl space-y-2">
              <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#009ac7]" />
                Bank Payout Details
              </div>
              {selectedVendor.onboarding?.bankDetails ? (
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>
                    <span className="font-semibold text-gray-700">Bank Name:</span>{" "}
                    {selectedVendor.onboarding.bankDetails.bankName}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Branch:</span>{" "}
                    {selectedVendor.onboarding.bankDetails.branch || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Routing No:</span>{" "}
                    {selectedVendor.onboarding.bankDetails.routingNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Account No:</span>{" "}
                    <span className="font-mono font-medium text-gray-900">
                      {selectedVendor.onboarding.bankDetails.accountNumber}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Account Holder Name:</span>{" "}
                    {selectedVendor.onboarding.bankDetails.accountHolderName}
                  </p>
                  {selectedVendor.onboarding.bankDetails.bankDocName && (
                    <p>
                      <span className="font-semibold text-gray-700">Bank Document:</span>{" "}
                      {selectedVendor.onboarding.bankDetails.bankDocName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No bank details submitted yet.</p>
              )}
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedVendor(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedVendor._id, selectedVendor.userId?.name)}
                className="text-xs"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedVendor._id, selectedVendor.userId?.name)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Approve Seller
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

