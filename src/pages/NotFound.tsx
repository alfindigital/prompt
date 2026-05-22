import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found — Promptly</title>
        <meta name="description" content="The page you're looking for doesn't exist. Head back to your Promptly prompt library." />
        <meta property="og:title" content="Page Not Found — Promptly" />
        <meta property="og:description" content="The page you're looking for doesn't exist. Head back to your Promptly prompt library." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://promlib.lovable.app/" />
      </Helmet>
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <p className="mb-2 text-4xl font-bold" aria-hidden="true">404</p>
          <h1 className="mb-4 text-xl text-muted-foreground">Page Not Found</h1>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </a>
        </div>
      </main>
    </>
  );
};

export default NotFound;
