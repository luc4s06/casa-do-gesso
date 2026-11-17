# Casa do Gesso — Sistema de Gestão Interna

Sistema web para uso exclusivo do proprietário da Casa do Gesso: clientes, retiradas de material,
pagamentos, preços e relatórios semanais.

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

## Logo da empresa

Não é necessário editar código para trocar a logo: vá em **Configurações → Enviar logo**.
A imagem é salva no navegador e passa a aparecer no menu lateral, no cabeçalho e nos
comprovantes em PDF. Enquanto nenhuma logo for enviada, o sistema mostra "CASA DO GESSO".

## Persistência dos dados

Nesta primeira versão os dados ficam salvos no `localStorage` do navegador (clientes,
retiradas, pagamentos, preços e configurações), então nada se perde ao fechar a aba.

Toda a leitura/escrita passa por `src/services/storage.ts`. Para migrar no futuro para
Supabase, PostgreSQL ou outro banco, basta reescrever as funções desse arquivo — o restante
do app (services e páginas) não precisa mudar.

## Regra do saldo

O saldo do cliente nunca é um valor solto: ele é sempre calculado a partir da soma das
retiradas menos a soma dos pagamentos (`src/services/reportService.ts → getClientBalance`).

## Regra dos preços

O preço configurado em **Materiais** vale apenas para novas retiradas. Cada retirada já
registrada guarda o preço unitário do momento em que foi feita — alterar o preço depois
não muda retiradas antigas.

## Materiais disponíveis

- Placa de Gesso (metro)
- Sinzal (kg)
- Saco de Gesso (kg)
- Bloco (metro)
