/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Tag,
  CreditCard,
  Plus,
  Shield,
  X,
  Store,
  ArrowRightLeft,
  Package,
  BarChart3,
  Hash,
  Palette,
  Calculator,
  Truck,
  HelpCircle,
  FileText,
  UserPlus,
  User,
  Percent,
  Settings,
  ChevronDown,
  ShoppingBag,
  Box,
  UsbIcon,
  Check,
  LucideIcon,
} from "lucide-react";
import { MdPayment, MdSettings } from "react-icons/md";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";
import { useGetSettingsQuery } from "@/redux/featured/setting/settingAPI";

type Role = "admin" | "vendor" | "user";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
  isCollapsed: boolean;
}

function normalizeRole(value: unknown): Role {
  if (!value || typeof value !== "string") return "user";
  const v = value.toLowerCase();
  if (["admin", "superadmin", "owner", "root"].includes(v)) return "admin";
  if (["vendor", "seller", "merchant", "shop_owner"].includes(v))
    return "vendor";
  return "user";
}

export function AppSidebar({
  isOpen,
  onClose,
  role: roleProp,
  isCollapsed,
}: AppSidebarProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const derivedRole = normalizeRole((currentUser as any)?.role);
  const role: Role = roleProp ?? derivedRole; // prefer prop, else derive

  const pathname = usePathname();
  // Consider child routes active as well, not only exact matches
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // State for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const iconConfig = {
    size: 18,
    className: "flex-shrink-0",
    active: "text-blue-700",
    inactive: "text-gray-600",
  } as const;

  // Navigation model
  const navigationItems = useMemo(
    () => ({
      shopManagement: [
        { icon: Store, label: "All Shop", href: "/admin/all-shop" },
        { icon: Store, label: "Add New Shop", href: "/admin/create-shop" },
        {
          icon: Store,
          label: "InActive Shops",
          href: "/admin/in-active-new-shops",
        },
      ],
      shopVendor: [
        { icon: Store, label: "Add New Shop", href: "/vendor/create-shop" },
        { icon: Store, label: "My Shops", href: "/vendor/my-shops" },
      ],
      productManagement: [
        { icon: Package, label: "All Products", href: "/admin/all-product" },
        {
          icon: Package,
          label: "Add New Product",
          href: "/admin/add-new-product",
        },
        {
          icon: Package,
          label: "Draft Products",
          href: "/admin/draft-products",
        },
        { icon: Hash, label: "Categories", href: "/admin/category-management" },
        { icon: Tag, label: "Tags", href: "/admin/tag-management" },
        { icon: Box, label: "Brand", href: "/admin/brand-management" },
        {
          icon: Palette,
          label: "Attributes",
          href: "/admin/product-attributes",
        },
        {
          icon: BarChart3,
          label: "Inventory",
          href: "/admin/inventory-management",
        },
      ],
      productVendor: [
        { icon: Package, label: "All Products", href: "/vendor/all-product" },
        {
          icon: Package,
          label: "Add New Product",
          href: "/vendor/add-new-product",
        },
      ],
      walletItems: [
        {
          icon: Calculator,
          label: "Approved Deposits",
          href: "/admin/approved-deposits",
        },
        {
          icon: Truck,
          label: "Reject Deposits",
          href: "/admin/reject-deposits",
        },
        {
          icon: CreditCard,
          label: "Refund Requests",
          href: "/admin/refund-requests",
        },
      ],
      faqItems: [
        { icon: HelpCircle, label: "All FAQs", href: "/admin/faqs" },
        { icon: FileText, label: "Add New FAQ", href: "/admin/add-new-faq" },
      ],
      termsItems: [
        { icon: HelpCircle, label: "All Terms", href: "/admin/all-terms" },
        { icon: FileText, label: "Add New Terms", href: "/admin/terms" },
      ],
      couponsItems: [
        { icon: Percent, label: "All Coupons", href: "/admin/coupons" },
        {
          icon: Plus,
          label: "Add Coupon",
          href: "/admin/coupons/add-new-coupons",
        },
      ],
      categoryItems: [
        { icon: Hash, label: "All Categories", href: "/admin/category-management" },
      ],
      settingsItems: [
        {
          icon: Settings,
          label: "General Settings",
          href: "/admin/shop-setting",
        },
        {
          icon: MdPayment as any,
          label: "Payment Settings",
          href: "/admin/payment-settings",
        },
        {
          icon: MdSettings as any,
          label: "SEOPage Settings",
          href: "/admin/SEOPage",
        },
        { icon: HelpCircle, label: "System FAQ", href: "/admin/faqs" },
      ],
      vendorItems: [
        { icon: Store, label: "Vendors", href: "/admin/all-vendors" },
        { icon: User, label: "Customers", href: "/admin/customers" },
      ],
      ecommerceManagement: [
        { icon: Calculator, label: "Taxes", href: "/admin/taxes" },
        { icon: Truck, label: "Shippings", href: "/admin/shippings" },
        { icon: CreditCard, label: "Withdrawals", href: "/admin/withdrawals" },
        { icon: UsbIcon, label: "Hero Banners", href: "/admin/banners" },
      ],
      orderManagement: [
        { icon: ShoppingCart, label: "Orders", href: "/admin/order" },
        { icon: Check, label: "Fraud Checker", href: "/admin/fraud-check" },
        { icon: Plus, label: "Create Order", href: "/admin/create-order" },
        {
          icon: ArrowRightLeft,
          label: "Transactions",
          href: "/admin/transaction",
        },
      ],
      orderVendor: [
        { icon: ShoppingCart, label: "Orders", href: "/vendor/order" },
      ],
      ecommerceManagementVendor: [
        { icon: CreditCard, label: "Withdrawals", href: "/vendor/withdrawals" },
      ],
      vendorCoupons: [
        { icon: Percent, label: "All Coupons", href: "/vendor/coupons" },
        {
          icon: Plus,
          label: "Add Coupon",
          href: "/vendor/coupons/add-new-coupons",
        },
      ],
    }),
    [],
  );

  // Auto-open a section if one of its children is active
  useEffect(() => {
    const next: Record<string, boolean> = {};
    (
      Object.keys(navigationItems) as Array<keyof typeof navigationItems>
    ).forEach((key) => {
      const items = navigationItems[key];
      next[key as string] = items.some((item) => isActive(item.href));
    });
    setOpenSections((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSection = (section: string) =>
    setOpenSections((p) => ({ ...p, [section]: !p[section] }));

  const renderLink = (href: string, Icon: LucideIcon, label: string) => (
    <Link
      href={href}
      key={`link-${href}`}
      onClick={() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) onClose();
      }}
      className={cn(
        "flex items-center gap-3 rounded-md text-sm transition-all duration-200 ease-in-out",
        "px-3 py-2.5",
        isActive(href)
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        isCollapsed ? "justify-center px-2" : "pl-4",
        "transform hover:translate-x-1",
      )}
    >
      <Icon
        size={iconConfig.size}
        className={cn(
          iconConfig.className,
          isActive(href) ? iconConfig.active : iconConfig.inactive,
          "transition-colors duration-200",
        )}
      />
      {!isCollapsed && (
        <span className="truncate transition-opacity duration-200">
          {label}
        </span>
      )}
    </Link>
  );

  const [openSection, setOpenSection] = useState<string | null>(null);

  const renderCollapsible = (
    Icon: LucideIcon,
    label: string,
    items: {
      icon: LucideIcon;
      label: string;
      href: string;
    }[],
    sectionKey: string,
  ) => {
    const isOpen = openSection === sectionKey;

    return (
      <Collapsible
        key={`collapsible-${sectionKey}`}
        open={isOpen}
        onOpenChange={() => setOpenSection(isOpen ? null : sectionKey)}
        className="transition-all duration-200 ease-in-out"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between rounded-md p-0 h-auto font-normal transition-all duration-200 ease-in-out",
              "hover:bg-gray-50 px-3 py-2.5",
              isCollapsed ? "justify-center px-2" : "pl-4",
              "text-gray-600 hover:text-gray-900",
              "group",
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                size={iconConfig.size}
                className={cn(
                  iconConfig.className,
                  "transition-colors duration-200",
                )}
              />
              {!isCollapsed && (
                <span className="truncate transition-opacity duration-200">
                  {label}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown
                size={16}
                className={cn(
                  "transition-all duration-200",
                  isOpen ? "rotate-180" : "",
                  "text-gray-500",
                  "group-hover:text-blue-600",
                )}
              />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-0" : "ml-2 pl-6 border-l border-gray-200",
            "data-[state=open]:animate-collapsible-down",
            "data-[state=closed]:animate-collapsible-up",
          )}
        >
          <div className="space-y-1 mt-1">
            {items.map((item) => (
              <Link
                key={`${sectionKey}-${item.href}`}
                href={item.href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768)
                    onClose();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-md text-sm font-normal transition-all duration-200 ease-in-out",
                  "px-3 py-2 hover:bg-gray-50 w-full",
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:text-gray-900",
                  isCollapsed ? "justify-center px-2" : "",
                  "transform hover:translate-x-1",
                )}
              >
                <item.icon
                  size={iconConfig.size}
                  className={cn(
                    iconConfig.className,
                    isActive(item.href)
                      ? iconConfig.active
                      : iconConfig.inactive,
                    "transition-colors duration-200",
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderSection = (
    title: string,
    items: {
      icon: LucideIcon;
      label: string;
      href: string;
    }[],
  ) => (
    <div key={`section-${title}`} className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map((item) => renderLink(item.href, item.icon, item.label))}
      </div>
    </div>
  );
const { data: settings } = useGetSettingsQuery();
 const site: any = settings?.[0];
  // ------------------------------------
  // Render
  // ------------------------------------
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-white text-black",
        "flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 md:static",
        isCollapsed ? "w-11 md:w-16" : "w-64",
        "overflow-hidden",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center justify-center gap-3 p-3 bg-white h-16 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "px-4",
          "shrink-0 border-b border-gray-200",
        )}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={100}
          height={100}
          priority
          unoptimized
          className="flex-shrink-0 rounded transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Mobile Close */}
      {!isCollapsed && (
        <div className="flex items-center justify-between p-4 md:hidden border-b">
          <h2 className="text-lg font-bold text-black">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 hover:rotate-90"
          >
            <X className="h-6 w-6 text-gray-400 transition-transform duration-300" />
          </button>
        </div>
      )}

      <nav className="flex-1 p-2 overflow-y-auto space-y-4 transition-all duration-300 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Shared: Dashboard */}
        <div key="main-section">
          {!isCollapsed && (
            <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
              MAIN
            </h3>
          )}
          {renderLink("/", LayoutDashboard, "Dashboard")}
        </div>

        {/* Admin-only sections */}
        {role === "admin" && (
          <>
            <div key="shop-management" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  SHOP MANAGEMENT
                </h3>
              )}
              <div className="md:ml-1">
                {renderCollapsible(
                  Store,
                  "Shops",
                  navigationItems.shopManagement,
                  "shopManagement",
                )}
              </div>
              {renderLink("/admin/my-shops", ShoppingBag, "My Shops")}
              {renderLink(
                "/admin/shop-transfer-request",
                ArrowRightLeft,
                "Shop Transfer Request",
              )}
            </div>

            <div key="product-management" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  PRODUCT MANAGEMENT
                </h3>
              )}
              <div className="ml-1">
                {renderCollapsible(
                  Package,
                  "Products",
                  navigationItems.productManagement.slice(0, 3),
                  "productManagement",
                )}
                {renderLink("/admin/category-management", Hash, "Categories")}
                {renderLink("/admin/tag-management", Tag, "Tags")}
                {renderLink("/admin/brand-management", Box, "Brand")}
                {renderLink("/admin/product-attributes", Palette, "Attributes")}
                {renderLink(
                  "/admin/inventory-management",
                  BarChart3,
                  "Inventory",
                )}
              </div>
            </div>

            <div key="ecommerce-section" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  E-COMMERCE MANAGEMENT
                </h3>
              )}
              <div className="ml-1">
                {renderLink("/admin/banners", UsbIcon, "Hero Banners")}
                {renderLink("/admin/taxes", Calculator, "Taxes")}
                {renderLink("/admin/shippings", Truck, "Shippings")}
                {renderLink("/admin/withdrawals", CreditCard, "Withdrawals")}
              </div>
            </div>

            <div key="wallet-section" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  WALLET
                </h3>
              )}
              <div className="ml-2">
                {renderCollapsible(
                  CreditCard,
                  "Wallet",
                  navigationItems.walletItems,
                  "walletItems",
                )}
              </div>
            </div>

            <div className="ml-1">
              {renderSection(
                "ORDER MANAGEMENT",
                navigationItems.orderManagement,
              )}
            </div>

            <div key="layout-section" className="space-y-2">
              <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider">
                LAYOUT / PAGE
              </h3>
              <div className="ml-2">
                {renderCollapsible(
                  HelpCircle,
                  "FAQs",
                  navigationItems.faqItems,
                  "faqItems",
                )}
                {renderCollapsible(
                  FileText,
                  "Terms",
                  navigationItems.termsItems,
                  "termsItems",
                )}
                <div className="-ml-1">
                  {renderLink(
                    "/admin/become-seller",
                    UserPlus,
                    "Become a Seller",
                  )}
                </div>
              </div>
            </div>

            <div key="user-control-section" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  USER CONTROL
                </h3>
              )}
              <div className="ml-1">
                {renderLink("/admin/all-users", Users, "All users")}
                {renderLink("/admin/admin-list", Shield, "Admin list")}
                <div className="ml-[6px]">
                  {renderCollapsible(
                    Store,
                    "Vendors",
                    navigationItems.vendorItems,
                    "vendorItems",
                  )}
                </div>
              </div>
            </div>

            <div key="coupons-section" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  COUPONS
                </h3>
              )}
              <div className="ml-[12px]">
                {renderCollapsible(
                  Percent,
                  "Coupons",
                  navigationItems.couponsItems,
                  "couponsItems",
                )}
              </div>
            </div>

            <div key="settings-section" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  SETTINGS
                </h3>
              )}
              <div className="ml-[12px]">
                {renderCollapsible(
                  Settings,
                  "Settings",
                  navigationItems.settingsItems,
                  "settingsItems",
                )}
              </div>
            </div>
          </>
        )}

        {/* Vendor-only sections */}
        {role === "vendor" && (
          <>
            <div key="shop-management" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  SHOP MANAGEMENT
                </h3>
              )}
              <div className="md:ml-1">
                {renderCollapsible(
                  Store,
                  "Shops",
                  navigationItems.shopVendor,
                  "shopManagement",
                )}
              </div>
            </div>
            <div key="product-management" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  PRODUCT MANAGEMENT
                </h3>
              )}
              <div className="ml-1">
                {renderCollapsible(
                  Package,
                  "Products",
                  navigationItems.productVendor.slice(0, 3),
                  "productManagement",
                )}
              </div>
            </div>
            <div className="ml-1">
              {renderSection("ORDER MANAGEMENT", navigationItems.orderVendor)}
            </div>
            <div>
              {renderSection(
                "E-COMMERCE MANAGEMENT",
                navigationItems.ecommerceManagementVendor,
              )}
            </div>
            <div key="coupons-section" className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 py-2 text-left uppercase text-xs font-semibold text-gray-400 tracking-wider transition-opacity duration-200">
                  COUPONS
                </h3>
              )}
              <div className="ml-[12px]">
                {renderCollapsible(
                  Percent,
                  "Coupons",
                  navigationItems.vendorCoupons,
                  "couponsItems",
                )}
              </div>
            </div>
          </>
        )}

        {/* Optionally, minimal menu for plain users so it never looks empty */}
        {role === "user" && (
          <>
            {renderSection("ORDERS", [
              {
                icon: ShoppingCart,
                label: "My Orders",
                href: "/account/orders",
              },
            ])}
            {renderSection("ACCOUNT", [
              { icon: User, label: "Profile", href: "/account/profile" },
              { icon: Settings, label: "Settings", href: "/account/settings" },
            ])}
          </>
        )}
      </nav>
    </aside>
  );
}

export default AppSidebar;
