import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <div className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}