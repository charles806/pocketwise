import React from "react";

const DashboardPage = () => {
  return (
    <main className="min-h-screen bg-(--background) flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-(--text-primary) mb-4">
          Dashboard
        </h1>
        <p className="text-(--text-secondary)">
          Welcome to PocketWise! This is your dashboard placeholder.
        </p>
      </div>
    </main>
  );
};

export default DashboardPage;
