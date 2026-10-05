"use client";

type VendorCardProps = {
  totalVendors: number;
  comparedTo: string;
};

export default function VendorCard({ totalVendors, comparedTo }: VendorCardProps) {
  return (
    <div className="bg-[#C9C9C926] text-card-foreground rounded-xl p-4 md:p-6 shadow-sm w-full max-w-full h-[200px] aspect-[358/199] flex flex-col justify-between">
      {/* Title */}
      <div>
        <h3 className="text-xl font-semibold">Total Sellers</h3>
        <p className="text-sm font-semibold text-muted-foreground">{comparedTo}</p>
      </div>

      {/* Value */}
      <div className="text-3xl md:text-4xl font-bold">{totalVendors}</div>
    </div>
  );
}
