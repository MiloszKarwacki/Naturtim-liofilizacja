import React from "react";
import Sidebar from "@/components/navigation/Sidebar";

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-gray-100 border-r border-gray-200">
        <Sidebar />
      </div>
      <div className="w-5/6 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default WorkspaceLayout;
