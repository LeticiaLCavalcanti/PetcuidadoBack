# PetCuidado — API

API REST do app [pet-cuidado-front](../pet-cuidado-front): usuários, pets e
carteira de vacinação.

## Tecnologias

Node.js · Express · MongoDB (Mongoose) · JWT · bcrypt

## Instalação

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e SECRET
npm run dev
```

Gere o `SECRET` com `openssl rand -hex 32`.

## Testes

```bash
npm run smoke          # roda contra o Atlas do .env
npm run smoke:memory   # sobe um MongoDB em memória
```

O modo em memória precisa de uma dependência instalada sob demanda — ela fica
fora do `package.json` de propósito, porque o build do Render traz
`devDependencies` junto e quebra:

```bash
npm i --no-save mongodb-memory-server
```

## Modelo de dados

Os dados são escopados em cadeia: **usuário → pet → vacina**.

```
User  ──< Animals (user)  ──< Vaccines (animal)
```

- `Animals.user` — dono do pet. Preenchido a partir do token, **nunca** do corpo
  da request, para que ninguém consiga cadastrar pet em nome de outro.
- `Vaccines.animal` — pet ao qual a vacina pertence. A posse é validada pelo
  dono do animal.

Consequências:

- Cada usuário só lê e altera os próprios registros.
- As rotas `findById` respondem **404** tanto para registro inexistente quanto
  para registro de outro dono, de propósito: assim não dá para descobrir o que
  existe na conta alheia sondando IDs.
- Excluir um pet remove as vacinas dele junto, para não deixar órfãos.
- Listagens vazias devolvem `[]` com status 200 (antes devolviam 404).

## Tipos dos campos

- `birth` e `date` são `Date`. Trafegam em ISO `YYYY-MM-DD` na entrada e voltam
  em ISO 8601 completo. Qualquer outro formato é recusado com 400 — inclusive
  `15/03/2021` e datas que não existem, como `2021-02-31`. Formatar para o
  padrão brasileiro é papel do app.
- `weight` é `Number`, em quilos. `"28kg"` é recusado; envie `28`.

## Rotas

| Método | Rota | Autenticada | Descrição |
| --- | --- | --- | --- |
| `GET` | `/health` | não | Status da API e do banco |
| `POST` | `/user/create` | não | Cria usuário e devolve `{ token }` |
| `POST` | `/auth/login` | não | Autentica e devolve `{ token }` |
| `GET` | `/user/` | sim | Lista usuários |
| `GET` | `/user/findById/:id?` | sim | Sem `id`, devolve o usuário do token |
| `PATCH` | `/user/update/:id` | sim | Atualiza o próprio usuário |
| `GET` | `/animals/list` | sim | Pets do usuário logado |
| `GET` | `/animals/findById/:id` | sim | Detalhe do pet |
| `POST` | `/animals/create` | sim | Cadastra pet (`name`, `birth`, `breed` obrigatórios) |
| `PATCH` | `/animals/update/:id` | sim | Atualiza pet |
| `DELETE` | `/animals/delete/:id` | sim | Remove pet e as vacinas dele |
| `GET` | `/vaccines/list` | sim | Vacinas de todos os pets do usuário |
| `GET` | `/vaccines/list?animal=:id` | sim | Vacinas de um pet |
| `GET` | `/vaccines/findById/:id` | sim | Detalhe da vacina |
| `POST` | `/vaccines/create` | sim | Cadastra vacina (`animal`, `name`, `date` obrigatórios) |
| `PATCH` | `/vaccines/update/:id` | sim | Atualiza vacina |
| `DELETE` | `/vaccines/delete/:id` | sim | Remove vacina |

Rotas autenticadas esperam o header `Authorization: Bearer <token>`.

## Migração dos registros antigos

Registros criados antes desta versão têm dois problemas: não têm `user` /
`animal` (somem das listagens, porque não casam com nenhum filtro) e guardam
data/peso como string. Rode a migração depois de subir esta versão:

```bash
npm run migrate                                        # relata (dry-run)
node scripts/migrate.mjs --apply                       # converte datas e pesos
node scripts/migrate.mjs --apply --owner voce@email.com # converte e adota
node scripts/migrate.mjs --apply --delete              # converte e apaga
```

A migração faz duas coisas: converte `birth`/`date`/`weight` de string para os
tipos novos, e trata os registros sem dono. Com `--owner`, os pets órfãos
passam a ser do usuário informado e as vacinas órfãs são ligadas ao primeiro
pet dele (ou ao `--animal <id>`).

Valores que o script não consegue interpretar (uma data escrita como
`"sei la"`, por exemplo) são listados e deixados intactos, para você corrigir
à mão — ele não chuta.
