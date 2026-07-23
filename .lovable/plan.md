# Plano de Melhorias — SCFV

Escopo grande. Vou preservar tudo que já existe e implementar por fases, sem recriar o projeto. Antes de começar, preciso confirmar alguns pontos que impactam decisões estruturais.

## Fases propostas

### Fase 1 — Aprovação de cadastro + remoção do Google + senha simplificada
- Migração: adicionar `account_status` em `profiles` (`pending`, `approved`, `rejected`, `disabled`) + `phone` obrigatório no signup.
- Trigger `handle_new_user`: novos usuários entram como `pending` (exceto o Dono `kainanb935@gmail.com`, que continua auto-aprovado como `owner`).
- `ProtectedRoute` bloqueia acesso quando status ≠ `approved` e mostra tela dedicada (Aguardando aprovação / Reprovado / Desativado) com animação.
- `Auth.tsx`: remover botões Google, adicionar campo Telefone com máscara, ajustar validação de senha (min 8, 1 letra, 1 número), traduzir mensagens.
- Remover integração `@lovable.dev/cloud-auth-js` da UI (mantém arquivo auto-gerado).

### Fase 2 — Painel Master: Solicitações + Gestão de Usuários
- Nova aba no `/master`: **Solicitações de Cadastro** (nome, e-mail, telefone, data) com ações Aprovar como Funcionário / Aprovar como Admin / Reprovar.
- Nova aba **Gestão de Usuários** (exclusiva Dono): bloquear, reativar, excluir, alterar papel. Excluir chama edge function com service role para remover de `auth.users` e encerrar sessões.
- Edge function `admin-user-action` (verify_jwt=false + validação manual de owner) para operações privilegiadas.

### Fase 3 — Auditoria completa
- Ampliar `audit_logs`: `ip`, `user_agent`, `device_type`, `os`, `browser`, `location` (cidade/estado/país), `module`, `result`, `profile_role`.
- Edge function `log-action` que recebe evento do cliente, extrai IP do header, consulta geolocalização (ipapi.co gratuito) e grava. Chamada em todos os pontos críticos (login, logout, CRUD de crianças/pontos/horas/recompensas/usuários, aprovações, exportações).
- Página de auditoria com filtros (usuário, período, módulo, tipo, resultado) e busca instantânea. Somente leitura — nenhuma policy de UPDATE/DELETE para não-service.

### Fase 4 — Regras de negócio
- Cadastro de criança: substituir idade por `birth_date`, calcular idade, bloquear fora de 4–18 anos com mensagem amigável.
- Dashboard de segurança no Master: usuários online (sessões recentes < 5 min via auditoria de login), contagem por papel, cadastros pendentes, últimos logins, últimas alterações.

### Fase 5 — Notificações
- Tabela `notifications` (user_id, title, body, type, read_at, created_at) + realtime.
- Sino no `AppHeader` com badge, dropdown, "marcar como lida" / "marcar todas".
- Triggers/edge functions gerando notificações para Dono (novo pendente, novo admin, login falho), Admin (nova criança, pontos, horas), Funcionário (aprovação, alteração de horas).

### Fase 6 — Home Top 3
- Card "Ranking das Crianças" com foto, nome, pontos, medalhas ouro/prata/bronze e animação de entrada.

### Fase 7 — Tradução completa
- Varrer todos os componentes (incluindo shadcn/sonner/date-fns locale `ptBR`) e traduzir textos remanescentes em inglês. Configurar `date-fns` com locale pt-BR globalmente.

## Detalhes técnicos

- **Geolocalização por IP:** ipapi.co (grátis até 1k/dia, sem chave). Feito na edge function, nunca no cliente.
- **Sessões ativas:** derivadas dos eventos `login` na auditoria (janela 5 min). Não há API pública Supabase para listar sessões vivas sem service role — usaremos a auditoria como fonte.
- **Exclusão de conta:** edge function chama `supabase.auth.admin.deleteUser()`, o que invalida todas as sessões automaticamente.

## Perguntas antes de começar

1. **Volume:** posso executar as 7 fases em sequência sem parar para revisão, ou você prefere aprovar fase por fase? (Recomendo sequência, mas ficaria uma resposta longa.)
2. **Usuários já cadastrados hoje:** devo marcá-los todos como `approved` na migração (para não travar você e outros já existentes), certo?
3. **Login falho:** a auditoria de tentativas malsucedidas exige interceptar `signInWithPassword` no cliente (não há webhook nativo). Ok registrar assim, mesmo sabendo que um usuário mal-intencionado poderia burlar o log local?
