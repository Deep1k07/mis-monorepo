import { AuthProvider } from "@/providers/auth-provider";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
