# Casa do Gesso — Sistema de Gestão Interna

Sistema web para uso do proprietário da Casa do Gesso: clientes, retiradas de material,
pagamentos, preços e relatórios semanais. Os dados ficam no **Supabase** e o acesso é
protegido por **login e senha**, então funciona no computador e no celular.

## Configuração do Supabase (uma vez só)

1. Crie um projeto em https://supabase.com (o plano gratuito atende).
2. No painel, abra **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique
   em **Run**. Isso cria as tabelas e liga a segurança (só quem está logado lê ou grava).
3. **Desligue o cadastro público:** em **Authentication → Sign In / Providers → Email**,
   desative **Allow new users to sign up** (e, se aparecer, **Confirm email** pode ficar como preferir).
   Sem isso, qualquer pessoa que descobrir o endereço do site poderia criar uma conta e ver os dados.
4. Crie o seu usuário em **Authentication → Users → Add user → Create new user**
   (e-mail e senha). É com esse e-mail e senha que você entra no sistema.
5. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public
```

Na Vercel, cadastre as mesmas duas variáveis em **Project Settings → Environment Variables**
e faça um novo deploy. A chave `anon` pode ficar no site; quem protege os dados é o login e as
regras do banco (RLS). **Nunca** use a chave `service_role` aqui.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Trazendo os dados que estavam só no navegador

Se você já cadastrou clientes, retiradas e pagamentos na versão antiga, abra o sistema **no mesmo
navegador em que usava antes**, entre com seu login e vá em **Configurações**. Aparece um aviso
"Dados salvos só neste navegador" com o botão **Enviar dados para o banco**. Os números de
comprovante são mantidos e a importação pode ser repetida sem duplicar nada. Os dados locais
não são apagados.

## Enviar comprovante pelo WhatsApp

Na tela do comprovante de retirada há o botão **Enviar no WhatsApp**. Ele abre o WhatsApp já com a
conversa do cliente (usa o telefone cadastrado) e a mensagem pronta, com cada material, quantidade,
preço unitário, subtotal do item, total da retirada e saldo. Você só confere e toca em enviar.
Se o telefone do cliente estiver incompleto, o WhatsApp abre para você escolher o contato.
O comprovante de retirada não é mais gerado em PDF. Na tela do comprovante há dois botões:

- **Enviar imagem**: gera uma imagem PNG do comprovante. No celular abre a lista de compartilhamento
  (escolha o WhatsApp e o cliente). No computador a imagem é baixada para você anexar no WhatsApp.
- **Enviar texto**: abre o WhatsApp com a mensagem em texto (também disponível na lista de **Retiradas**).

## Logo da empresa

Vá em **Configurações → Enviar logo**. A imagem é salva no banco e passa a aparecer no menu
lateral, no cabeçalho e nos comprovantes em PDF, em qualquer aparelho. Enquanto nenhuma logo for
enviada, o sistema mostra "CASA DO GESSO".

## Como os dados são guardados

Toda a comunicação com o banco passa por `src/services/` (que usa `src/lib/supabase.ts`).
O número de cada retirada e pagamento é gerado pelo próprio banco, então não repete mesmo usando
dois aparelhos ao mesmo tempo.

## Regra do saldo

O saldo do cliente nunca é um valor solto: ele é sempre calculado a partir da soma das
retiradas menos a soma dos pagamentos (`src/services/reportService.ts`).

## Regra dos preços

O preço configurado em **Materiais** vale apenas para novas retiradas. Cada retirada já
registrada guarda o preço unitário do momento em que foi feita — alterar o preço depois
não muda retiradas antigas.

## Materiais disponíveis

- Placa de Gesso (metro)
- Sinzal (kg)
- Saco de Gesso (kg)
- Bloco (metro)
