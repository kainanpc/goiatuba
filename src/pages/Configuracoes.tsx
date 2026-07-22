import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, Building2, Bell, Palette, Save } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "scfv:institutional-settings";

interface Institutional {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  responsible: string;
  notes: string;
}

const DEFAULTS: Institutional = {
  name: "SCFV · Prefeitura Municipal",
  cnpj: "",
  address: "",
  phone: "",
  email: "",
  responsible: "",
  notes: "",
};

export default function Configuracoes() {
  const { role } = useAuth();
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState<Institutional>(DEFAULTS);
  const [notifyPoints, setNotifyPoints] = useState(true);
  const [notifyHours, setNotifyHours] = useState(true);

  const readOnly = role !== "owner" && role !== "admin";

  useEffect(() => {
    document.title = "Configurações · SCFV";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setNotifyPoints(localStorage.getItem("scfv:notify-points") !== "0");
    setNotifyHours(localStorage.getItem("scfv:notify-hours") !== "0");
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem("scfv:notify-points", notifyPoints ? "1" : "0");
    localStorage.setItem("scfv:notify-hours", notifyHours ? "1" : "0");
    toast.success("Configurações salvas");
  }

  const field = (k: keyof Institutional) => ({
    value: data[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value })),
    disabled: readOnly,
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <header className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Settings className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Preferências gerais, informações institucionais e notificações.
          </p>
        </div>
      </header>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Informações institucionais</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome da instituição</Label>
            <Input {...field("name")} />
          </div>
          <div>
            <Label>CNPJ</Label>
            <Input {...field("cnpj")} placeholder="00.000.000/0000-00" />
          </div>
          <div>
            <Label>Responsável</Label>
            <Input {...field("responsible")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Endereço</Label>
            <Input {...field("address")} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input {...field("phone")} />
          </div>
          <div>
            <Label>E-mail de contato</Label>
            <Input {...field("email")} type="email" />
          </div>
          <div className="sm:col-span-2">
            <Label>Observações</Label>
            <Textarea rows={3} {...field("notes")} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Aparência</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(t)}
            >
              {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Notificações</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Novos pontos registrados</p>
              <p className="text-xs text-muted-foreground">Exibir avisos ao lançar pontos.</p>
            </div>
            <Switch checked={notifyPoints} onCheckedChange={setNotifyPoints} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alterações no banco de horas</p>
              <p className="text-xs text-muted-foreground">Avisar sobre novos lançamentos da equipe.</p>
            </div>
            <Switch checked={notifyHours} onCheckedChange={setNotifyHours} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={readOnly}>
          <Save className="mr-2 h-4 w-4" /> Salvar configurações
        </Button>
      </div>
    </div>
  );
}