import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { LoaderCircle, Clock, ShieldAlert, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
  requireRole?: AppRole;
}

export function ProtectedRoute({ children, requireRole }: Props) {
  const { user, role, profile, loading, signOut } = useAuth();
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

  const status = profile?.account_status;
  if (status && status !== "approved") {
    return <StatusScreen status={status} reason={profile?.status_reason ?? null} onSignOut={signOut} />;
  }

  if (requireRole && role !== requireRole && !(requireRole === "admin" && role === "owner")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function StatusScreen({
  status,
  reason,
  onSignOut,
}: {
  status: "pending" | "rejected" | "disabled";
  reason: string | null;
  onSignOut: () => Promise<void>;
}) {
  const config = {
    pending: {
      Icon: Clock,
      title: "Aguardando aprovação",
      body:
        "Seu cadastro foi enviado com sucesso. Aguarde a aprovação do administrador. Assim que sua conta for analisada, você poderá acessar o sistema.",
      tone: "text-primary",
      bg: "bg-primary/10",
    },
    rejected: {
      Icon: ShieldAlert,
      title: "Cadastro não aprovado",
      body:
        "Seu cadastro não foi aprovado. Caso considere que isso ocorreu por engano, entre em contato com o administrador do sistema.",
      tone: "text-destructive",
      bg: "bg-destructive/10",
    },
    disabled: {
      Icon: Ban,
      title: "Conta desativada",
      body: "Sua conta foi desativada pelo administrador do sistema.",
      tone: "text-destructive",
      bg: "bg-destructive/10",
    },
  }[status];
  const { Icon } = config;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 gradient-hero opacity-90" aria-hidden />
      <div className="relative z-10 w-full max-w-lg animate-scale-in rounded-2xl border bg-card p-8 text-center shadow-elegant">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${config.bg} ${config.tone}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-bold">{config.title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{config.body}</p>
        {reason && (
          <p className="mt-3 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <strong>Motivo:</strong> {reason}
          </p>
        )}
        {status === "pending" && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Aguardando análise
          </div>
        )}
        <Button className="mt-6 w-full" variant="outline" onClick={() => { void onSignOut(); }}>
          Sair
        </Button>
      </div>
    </div>
  );
}