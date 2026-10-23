# TaskFlow Backend

API REST do **TaskFlow**, responsável pelo gerenciamento de tarefas, validação de dados, regras de aplicação, persistência e exposição dos recursos por HTTP.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-validation-3E67B1)
![Vitest](https://img.shields.io/badge/Vitest-tests-6E9F18?logo=vitest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-E2E-2B2B2B)

## Visão geral

O TaskFlow Backend centraliza as operações relacionadas às tarefas e disponibiliza uma API que pode ser consumida por diferentes tipos de clientes, como aplicações web, mobile, desktop ou outros serviços.

A implementação segue uma arquitetura em camadas, com responsabilidades separadas entre rotas, middlewares, controllers, services, domínio, repositories e mappers. A persistência atual utiliza arquivo JSON, mas foi isolada por meio de `TaskRepository`, permitindo a substituição por outra tecnologia sem alterar as regras centrais da aplicação.

## Principais recursos

- CRUD completo de tarefas.
- Consulta individual por UUID.
- Filtros por status, prioridade e busca textual.
- Ordenação por criação, vencimento, prioridade e título.
- Alternância entre tarefa concluída e pendente.
- Estatísticas por status e tarefas atrasadas.
- Validação de entrada com Zod.
- DTOs distintos para criação, substituição, atualização, parâmetros, consultas e respostas.
- Tratamento centralizado de erros.
- Persistência em arquivo JSON.
- Repository em memória para testes.
- Injeção de dependências.
- `Clock` e `IdGenerator` substituíveis.
- Testes unitários e end-to-end.

## Tecnologias

| Tecnologia | Papel no projeto |
| --- | --- |
| **Node.js 20+** | ambiente de execução do backend |
| **Express 5** | servidor HTTP, rotas e middlewares |
| **TypeScript** | tipagem estática e organização do código |
| **Zod** | schemas, validação e transformação de dados em runtime |
| **JSON** | mecanismo atual de persistência |
| **Vitest** | execução dos testes unitários e E2E |
| **Supertest** | requisições HTTP nos testes end-to-end |
| **tsx** | execução do TypeScript em modo de desenvolvimento |

## Arquitetura

O projeto utiliza uma arquitetura em camadas com separação de responsabilidades e dependências orientadas para abstrações.

```text
cliente
   │
   ▼
HTTP / JSON
   │
   ▼
routes + middlewares + controllers
   │
   ▼
services
   │
   ▼
domain
   │
   ▼
repositories
   │
   ▼
persistência
```

O fluxo principal de uma requisição é:

```text
HTTP
  │
  ▼
routes
  │
  ▼
validate
  │
  ▼
DTO de entrada
  │
  ▼
controller
  │
  ▼
service
  │
  ▼
repository
  │
  ▼
persistência
```

No retorno, a entidade é convertida para o formato externo pelo mapper antes da resposta HTTP.

### Princípios aplicados

- **Responsabilidade única:** cada camada possui uma função delimitada.
- **Entidade diferente de DTO:** a entidade utiliza tipos internos, enquanto a API trabalha com representações próprias para entrada e saída.
- **Repository como contrato:** os services dependem da abstração `TaskRepository`, não de uma implementação específica.
- **Inversão de dependência:** regras de aplicação não dependem diretamente de detalhes de infraestrutura.
- **Injeção de dependências:** repository, relógio e gerador de identificadores são fornecidos externamente.
- **Composition root:** `container.ts` concentra a criação e conexão das dependências concretas.
- **Validação na fronteira:** dados recebidos pela API passam pelos schemas Zod antes de chegar às regras da aplicação.

## Estrutura do projeto

```text
src/
├── app.ts
├── container.ts
├── server.ts
│
├── controllers/
│   └── task.controller.ts
│
├── domain/
│   └── task.entity.ts
│
├── dtos/
│   ├── common.ts
│   ├── create-task.dto.ts
│   ├── index.ts
│   ├── list-tasks-query.dto.ts
│   ├── replace-task.dto.ts
│   ├── task-id-params.dto.ts
│   ├── task-response.dto.ts
│   ├── task-stats.dto.ts
│   └── update-task.dto.ts
│
├── errors/
│   └── app-error.ts
│
├── mappers/
│   └── task.mapper.ts
│
├── middlewares/
│   ├── error-handler.ts
│   ├── not-found.ts
│   └── validate.ts
│
├── repositories/
│   ├── in-memory-task.repository.ts
│   ├── json-task.repository.ts
│   └── task.repository.ts
│
├── routes/
│   └── task.routes.ts
│
├── services/
│   ├── task-query.ts
│   ├── task-stats.service.ts
│   └── task.service.ts
│
└── shared/
    ├── clock.ts
    └── id-generator.ts
```

## Requisitos

- Node.js **20 ou superior**
- npm

## Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

## Executando em desenvolvimento

```bash
npm run dev
```

A API será iniciada em:

```text
http://localhost:3000
```

Endpoint principal:

```text
http://localhost:3000/api/tasks
```

Health check:

```text
http://localhost:3000/health
```

Para utilizar outra porta:

```bash
PORT=4000 npm run dev
```

## Build e execução

Gere a versão compilada:

```bash
npm run build
```

Depois execute:

```bash
npm start
```

## Scripts disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | inicia o servidor em desenvolvimento com recarga automática |
| `npm run build` | compila o TypeScript |
| `npm start` | executa a versão compilada |
| `npm run typecheck` | verifica os tipos sem gerar arquivos |
| `npm test` | executa todos os testes |
| `npm run test:unit` | executa somente os testes unitários |
| `npm run test:e2e` | executa somente os testes end-to-end |
| `npm run test:watch` | executa os testes em modo de observação |
| `npm run test:coverage` | gera relatório de cobertura |

## Modelo de tarefa

Exemplo de representação devolvida pela API:

```json
{
  "id": "5d12f8b4-11a0-4eef-8463-388f9496d3a4",
  "title": "Preparar material da aula",
  "description": "",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-11-05",
  "createdAt": "2026-10-23T15:00:00.000Z",
  "updatedAt": "2026-10-23T15:00:00.000Z"
}
```

Valores aceitos para `status`:

```text
pending
in_progress
done
```

Valores aceitos para `priority`:

```text
low
medium
high
```

`dueDate` também pode ser `null`.

## Endpoints

| Método | Rota | Descrição | Sucesso |
| :---: | --- | --- | :---: |
| `GET` | `/api/tasks` | lista tarefas | `200` |
| `GET` | `/api/tasks/stats` | retorna estatísticas | `200` |
| `GET` | `/api/tasks/:id` | consulta uma tarefa | `200` |
| `POST` | `/api/tasks` | cria uma tarefa | `201` |
| `PUT` | `/api/tasks/:id` | substitui os campos editáveis | `200` |
| `PATCH` | `/api/tasks/:id` | atualiza campos enviados | `200` |
| `PATCH` | `/api/tasks/:id/toggle` | conclui ou reabre uma tarefa | `200` |
| `DELETE` | `/api/tasks/:id` | exclui uma tarefa | `204` |

## Filtros e ordenação

O endpoint:

```text
GET /api/tasks
```

aceita os seguintes parâmetros:

| Parâmetro | Finalidade |
| --- | --- |
| `status` | filtra pelo status |
| `priority` | filtra pela prioridade |
| `search` | pesquisa em título e descrição |
| `sort` | define o campo de ordenação |
| `order` | define ordem crescente ou decrescente |

Campos aceitos em `sort`:

```text
createdAt
dueDate
priority
title
```

Valores aceitos em `order`:

```text
asc
desc
```

Exemplo:

```text
GET /api/tasks?status=pending&sort=dueDate&order=asc
```

## Validação e erros

Os dados recebidos são validados com Zod antes de chegar aos controllers.

Principais respostas de erro:

| Status | Situação |
| :---: | --- |
| `400` | dados inválidos, UUID inválido, PATCH vazio ou JSON malformado |
| `404` | tarefa ou rota não encontrada |
| `500` | erro interno inesperado |

Exemplo de erro de validação:

```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "field": "title",
      "message": "title é obrigatório"
    }
  ]
}
```

## Testes

O projeto utiliza **Vitest** e **Supertest**.

```bash
npm test
npm run test:unit
npm run test:e2e
npm run test:watch
npm run test:coverage
```

### Cobertura dos testes

| Tipo | Arquivo | O que cobre |
| --- | --- | --- |
| Unitário | `tests/unit/task.service.test.ts` | regras do CRUD |
| Unitário | `tests/unit/task-stats.service.test.ts` | estatísticas e tarefas atrasadas |
| Unitário | `tests/unit/task-query.test.ts` | filtros e ordenação |
| Unitário | `tests/unit/task.mapper.test.ts` | conversão entre representações |
| Unitário | `tests/unit/dtos.test.ts` | validação, padrões e conversões |
| Unitário | `tests/unit/middlewares.test.ts` | `validate` e `errorHandler` |
| Unitário | `tests/unit/repositories.test.ts` | contrato dos repositories |
| E2E | `tests/e2e/tasks.e2e.test.ts` | fluxo HTTP completo |

Os testes não utilizam o arquivo real `data/tasks.json`.

Os testes unitários utilizam o repository em memória e os testes E2E criam uma pasta temporária que é removida ao final da execução.

## Testando a API com `curl`

Criar uma tarefa:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Preparar material da aula",
    "priority":"high",
    "dueDate":"2026-11-05"
  }'
```

Listar tarefas:

```bash
curl http://localhost:3000/api/tasks
```

Concluir ou reabrir:

```bash
curl -X PATCH http://localhost:3000/api/tasks/<id>/toggle
```

Excluir:

```bash
curl -X DELETE http://localhost:3000/api/tasks/<id>
```

## Persistência

A implementação atual utiliza:

```text
data/tasks.json
```

A persistência é acessada por meio da interface `TaskRepository`.

Isso permite substituir o armazenamento atual por outro mecanismo sem alterar os services:

```ts
createApp({
  repository: new MinhaImplementacaoDeRepository()
});
```

A nova implementação deve respeitar o contrato de `TaskRepository`.

## Integração com clientes

A API não depende de uma tecnologia específica de frontend. Qualquer cliente capaz de realizar requisições HTTP e trabalhar com JSON pode consumir os endpoints.

Exemplos:

```text
aplicação web
aplicação mobile
aplicação desktop
CLI
outro serviço
```

### Endereços comuns em desenvolvimento

| Ambiente do cliente | Base da API |
| --- | --- |
| navegador / web local | `http://localhost:3000/api` |
| desktop local | `http://localhost:3000/api` |
| emulador Android | `http://10.0.2.2:3000/api` |
| simulador iOS | `http://localhost:3000/api` |
| dispositivo físico | `http://<IP-do-computador>:3000/api` |

No Android, HTTP sem TLS pode exigir configuração específica de *cleartext traffic* durante o desenvolvimento.

## Health check

A disponibilidade básica do serviço pode ser consultada em:

```text
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

## Evolução da persistência

Como as regras de aplicação dependem da abstração `TaskRepository`, uma futura implementação com banco de dados pode substituir o JSON sem exigir alterações no fluxo principal do backend.

Exemplos possíveis:

```text
PostgreSQL
MySQL
MongoDB
SQLite
```

A adoção de qualquer uma dessas tecnologias não faz parte da implementação atual; representa apenas uma possibilidade de evolução permitida pela arquitetura existente.

## Licença

Defina aqui a licença adotada para o projeto.
