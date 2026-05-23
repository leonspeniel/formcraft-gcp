import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FormCraft - Dynamic Form Builder",
  description: "Create, publish, and analyze dynamic interactive forms with instant responses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-container">
          <header className="main-navbar">
            <div className="navbar-logo" onClick={() => { if (typeof window !== "undefined") window.location.href = "/"; }}>
              <span className="logo-accent">Form</span>Craft
            </div>
            <nav className="navbar-links">
              {/* Navigation links will dynamically render or handle routing */}
              <button
                className="nav-btn-text"
                onClick={() => { if (typeof window !== "undefined") window.location.href = "/dashboard"; }}
              >
                Dashboard
              </button>
              <button
                id="nav-logout-btn"
                className="nav-btn-outline"
                style={{ display: "none" }}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("auth_token");
                    window.location.href = "/login";
                  }
                }}
              >
                Sign Out
              </button>
            </nav>
          </header>
          <main className="main-content">{children}</main>
          <footer className="main-footer">
            <p>&copy; 2026 FormCraft. Engineered with modern stateless microservices on GCP.</p>
          </footer>
        </div>
        
        {/* Dynamic script to display sign out button if logged in */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const token = localStorage.getItem("auth_token");
                  if (token) {
                    const btn = document.getElementById("nav-logout-btn");
                    if (btn) btn.style.display = "block";
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
