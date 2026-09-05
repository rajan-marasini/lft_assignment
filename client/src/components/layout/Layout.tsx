import { Outlet } from "react-router";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Layout wraps every page with the shared Header and Footer.
 * Pages render via <Outlet />.
 */
export const Layout = () => (
  <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col">
    <Header />
    <div className="flex-1 flex flex-col">
      <Outlet />
    </div>
    <Footer />
  </div>
);
