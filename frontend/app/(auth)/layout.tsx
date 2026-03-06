import type { Metadata } from "next";
// sjsj
export const metadata: Metadata = {
  title: "Login - SmartClinic",
  description: "Login to SmartClinic",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
