import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  requireRole?: AppRole;
}

export function ProtectedRoute({ children, requireRole }: Props) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (requireRole && role !== requireRole && !(requireRole === "admin" && role === "owner")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}