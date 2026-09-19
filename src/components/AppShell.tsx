import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppShell({
  children,
  bare,
}: {
  children: ReactNode;
  narrow?: boolean;
  bare?: boolean;
}) {
  return (
    <div className="flex min-h-dvh w-full max-w-full min-w-0 flex-col overflow-x-clip">
      <Navbar />
      <main
        className={
          bare
            ? "flex w-full min-w-0 flex-1"
            : "flex w-full min-w-0 flex-1 flex-col"
        }
      >
        {children}
      </main>
      <div className={bare ? "hidden lg:block" : undefined}>
        <Footer />
      </div>
    </div>
  );
}
