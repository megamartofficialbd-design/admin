/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  useLoginUserMutation,
  useLogoutMutation,
  useRegisterUserMutation,
} from "@/redux/featured/auth/authApi";
import { getSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser, setUser } from "@/redux/featured/auth/authSlice";
import { useCreateVendorMutation } from "@/redux/featured/vendor/vendorApi";
import { useRouter } from "next/navigation";

export function useAuthHandlers() {
  const dispatch = useAppDispatch();
  const [registerUser] = useRegisterUserMutation();
  const [createVendor] = useCreateVendorMutation();
  const [logout] = useLogoutMutation();
  const router = useRouter()

  const handleRegister = async (data: {
    name?: string;
    email: string;
    password: string;
  }) => {
    try {
      const res = await registerUser(data).unwrap();

      if (res.data.role === 'vendor') {
        await createVendor({ userId: res.data._id });
      }
        
        toast.success('Registration successful!');
    } catch (err: any) {
      throw new Error(err?.data?.message || "Registration failed");
    }
  };
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const res = await loginUser(data).unwrap();

      if (res?.success) {
        const userRole = res?.data?.role;

        if (userRole !== "customer") {
          toast.success("Login successful");

        }

        if (res.data.role === 'customer') {

          const handleLogout = async () => {
            if (res.data?._id) {
              try {
                await logout(res.data._id).unwrap();
              } catch (err) { }
            }
            dispatch(logoutUser());
            toast.error("Customers are not allowed to log in here");
            await signOut({ redirect: false });
            router.push(`${process.env.NEXT_PUBLIC_CUSTOMER_URL}`)
          };

          handleLogout()
        }

        dispatch(setUser(res.data));
        return { success: true, user: res.data };
      } else {
        toast.error(res.message || "Login failed");
      }

      

    } catch (error: any) {
      toast.error("Invalid credentials");
      return { success: false };
    }
  };

  return { handleRegister, handleLogin };
}
