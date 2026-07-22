import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Save, LoaderCircle, KeyRound, Camera } from "lucide-react";
import { toast } from "sonner";

export default function Perfil() {
  const { user, profile, role, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    document.title = "Meu Perfil · SCFV";
    setFullName(profile?.full_name ?? "");
    setRoleTitle(profile?.role_title ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, role_title: roleTitle, phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("Erro ao salvar", { description: error.message });
    await refreshProfile();
    toast.success("Perfil atualizado");
  }

  async function handlePasswordChange() {
    if (newPassword.length < 8) return toast.error("A senha deve ter ao menos 8 caracteres");
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) return toast.error("Erro", { description: error.message });
    setNewPassword("");
    toast.success("Senha atualizada");
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem maior que 5MB");
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploadingAvatar(false);
      return toast.error("Falha no envio", { description: upErr.message });
    }
    const { data: signed, error: sErr } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (sErr || !signed) {
      setUploadingAvatar(false);
      return toast.error("Não foi possível gerar URL", { description: sErr?.message });
    }
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ avatar_url: signed.signedUrl })
      .eq("id", user.id);
    setUploadingAvatar(false);
    if (pErr) return toast.error("Erro ao salvar avatar", { description: pErr.message });
    await refreshProfile();
    toast.success("Foto atualizada");
  }

  const roleLabel = role === "owner" ? "Dono" : role === "admin" ? "Administrador" : "Funcionário";
  const initials = (profile?.full_name ?? profile?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações e senha de acesso.</p>
        </div>
      </header>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-input"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              title="Trocar foto"
            >
              {uploadingAvatar ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{profile?.full_name || profile?.email}</p>
            <p className="truncate text-sm text-muted-foreground">{profile?.email}</p>
            <Badge variant="secondary" className="mt-1">{roleLabel}</Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="role_title">Cargo</Label>
            <Input id="role_title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Ex.: Educador Social" />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar alterações
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Alterar senha</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="password"
            placeholder="Nova senha (mín. 8 caracteres)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button variant="secondary" onClick={handlePasswordChange} disabled={changingPw || !newPassword}>
            {changingPw ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Atualizar senha
          </Button>
        </div>
      </Card>
    </div>
  );
}