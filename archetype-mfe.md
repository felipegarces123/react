# Archetype Guide — geld-gestao-leads-mfe-front

## Overview

Este é um **Microfrontend (MFE) consumidor** construído com **Vite + React 18 + TypeScript**, usando **Module Federation** (`@module-federation/vite`) para expor páginas e componentes ao host. Segue **Clean Architecture** com separação estrita de responsabilidades entre camadas.

**Stack principal:**
- **Framework**: Vite 5 + React 18 + TypeScript (strict)
- **Gerenciador de pacotes**: `yarn@1.22.22`
- **Module Federation**: `@module-federation/vite` (consumer/remote)
- **UI**: `@bmg-genesis/components` + `@bmg-genesis/icons` (Design System interno BMG)
- **Estilização**: `styled-components` v6 + CSS Modules (`.module.css`)
- **Formulários**: Formik + Yup
- **HTTP**: Axios com factory de cliente por domínio (Agenda / Leads)
- **Autenticação**: `@bmg/arqf-auth` (`getCurrentAccount`, `LegacyAccountModel`)
- **Feature Toggles**: `@bmg/arqf-feature-toggle-permission`
- **Roteamento**: React Router DOM 7
- **Testes unitários**: Jest + React Testing Library

**Quando implementar novas funcionalidades:**
1. **Siga as camadas** na ordem: `domain → data → infra → presentation → main`
2. **Não misture** lógica de negócio em componentes de `presentation/`
3. **Adicione apenas novos arquivos** nas camadas apropriadas
4. **Referências de implementação**: `src/presentation/pages/Agendamento/`, `src/presentation/components/CreateAgendamento/`, `src/data/services/agendamento-service.ts`

---

## Project Structure

```text
geld-gestao-leads-mfe-front/
├── vite.config.ts                       # Vite + Module Federation config
├── jest.config.mjs                      # Jest configuration
├── jest.setup.ts                        # Jest global setup
├── tsconfig.json                        # TypeScript configuration
├── .env.dev / .env.staging / etc.       # Variáveis por ambiente
├── plugins/
│   ├── mfPlugins.js                     # Runtime plugin de Module Federation
│   ├── portGenerator.js                 # Gerador de porta determinística por pacote
│   └── sharedStrategy.ts                # Estratégia de compartilhamento (loaded-first)
├── __mocks__/
│   └── shared_app/                      # Mocks de dependências compartilhadas do host
│       ├── auth.store.ts                # Mock do store de autenticação
│       ├── DevProvider.tsx              # Provider de desenvolvimento local
│       └── store.ts                     # Mock de stores compartilhados
├── public/                              # Assets estáticos
└── src/
    ├── app.tsx                          # Entry point local (desenvolvimento isolado)
    ├── main.tsx                         # Bootstrap React (apenas para dev local)
    ├── vite-env.d.ts                    # Declarações de tipos Vite
    │
    ├── domain/                          # [Camada 1] Regras de negócio puras
    │   ├── models/                      # Tipos e interfaces dos modelos de dados
    │   │   ├── agendamento-model.ts
    │   │   ├── calendario-model.ts
    │   │   ├── leads-req-model.ts
    │   │   ├── leads-res-model.ts
    │   │   ├── menu-leads-model.ts
    │   │   ├── atendente-model.ts
    │   │   ├── base-model.ts
    │   │   └── index.ts
    │   ├── usecases/                    # Contratos (interfaces) dos casos de uso
    │   │   ├── authentication.ts
    │   │   └── index.ts
    │   ├── errors/                      # Erros de domínio tipados
    │   │   ├── invalid-credentials-error.ts
    │   │   ├── unexpected-error.ts
    │   │   ├── error-response.ts
    │   │   └── index.ts
    │   └── mocks/                       # Mocks de dados para testes unitários
    │       ├── mock-authentication.ts
    │       ├── mock-agendamento.ts
    │       └── index.ts
    │
    ├── data/                            # [Camada 2] Implementações e serviços HTTP
    │   ├── services/                    # Clientes Axios por domínio
    │   │   ├── api.ts                   # Factories de clientes Axios (Agenda / Leads)
    │   │   ├── agendamento-service.ts   # CRUD de agendamentos
    │   │   ├── lead-service.ts          # Prospecção de leads
    │   │   ├── prospeccao-service.ts    # Busca de leads por loja
    │   │   ├── base-propria-service.ts  # Upload e consulta de base própria
    │   │   ├── featoggle-service.ts     # Consulta de feature toggles por loja
    │   │   ├── oauth-token-service.ts   # Cache e renovação de token OAuth
    │   │   ├── api-service-interface.ts # Interface IApiService<P,R> + UseApiOptions
    │   │   └── base-service.ts          # Serviço genérico de base
    │   ├── usecases/                    # Implementações concretas de casos de uso
    │   │   ├── remote-authentication.ts # Implementa Authentication via HTTP
    │   │   ├── remote-authentication.spec.ts
    │   │   └── index.ts
    │   └── protocols/
    │       └── cache/                   # Protocolos SetStorage / GetStorage
    │
    ├── infra/                           # [Camada 3] Adaptadores de infraestrutura
    │   └── cache/
    │       ├── local-storage-adapter.ts # Implementa SetStorage + GetStorage
    │       ├── local-storage-adapter.spec.ts
    │       └── index.ts
    │
    ├── presentation/                    # [Camada 4] UI e interação com o usuário
    │   ├── pages/                       # Páginas expostas via Module Federation
    │   │   ├── Agendamento/
    │   │   │   ├── index.tsx            # Página principal de agendamento
    │   │   │   └── styles.ts            # Styled components da página
    │   │   ├── BasePropria/
    │   │   │   ├── index.tsx
    │   │   │   └── styles.ts
    │   │   └── Prospeccao/
    │   │       ├── index.tsx
    │   │       └── styles.ts
    │   ├── components/                  # Componentes reutilizáveis
    │   │   ├── CreateAgendamento/
    │   │   │   ├── index.tsx            # Componente (formulário com Formik + Yup)
    │   │   │   ├── validation.ts        # Schema Yup do componente
    │   │   │   └── styles.ts            # Styled components
    │   │   ├── StatusAgenda/
    │   │   │   ├── index.tsx
    │   │   │   ├── status-enum.ts       # Enum de status
    │   │   │   └── styles.ts
    │   │   ├── LuckyButton/
    │   │   │   ├── index.tsx
    │   │   │   └── luckybutton.module.css  # CSS Module
    │   │   ├── MenuLeads/
    │   │   │   ├── index.tsx
    │   │   │   └── menuleads.module.css
    │   │   ├── WeekSlider/
    │   │   ├── DaySlider/
    │   │   ├── ErrorField/
    │   │   ├── ModalWaiting/
    │   │   ├── NoPermission/
    │   │   ├── PlaceholderAgenda/
    │   │   ├── PlaceHolderBase/
    │   │   └── StatusBasePropria/
    │   ├── hooks/
    │   │   └── useApi.ts                # Hook genérico tipado para consumo de API
    │   ├── constants/                   # Constantes de UI por domínio
    │   │   ├── agendamento.constants.ts
    │   │   └── base.constants.ts
    │   ├── assets/                      # Assets SVG e imagens
    │   └── styles/
    │       └── theme.ts                 # Paleta de cores e tokens de tema
    │
    └── main/                            # [Camada 5] Composição da aplicação
        ├── adapters/                    # Adaptadores de estado global (ex: auth)
        │   ├── current-account-adapter.ts
        │   └── index.ts
        ├── factories/                   # Criação de instâncias com DI
        │   ├── http/
        │   │   ├── http-client-factory.ts   # Retorna httpClient de @bmg/arqf-api-client
        │   │   └── index.ts
        │   ├── cache/
        │   │   ├── local-storage-adapter-factory.ts
        │   │   └── index.ts
        │   ├── usecases/
        │   │   ├── remote-authentication-factory.ts
        │   │   └── index.ts
        │   ├── validation/              # Factories de validadores compostos
        │   │   └── index.ts
        │   └── pages/                   # Factories de páginas com DI injetada
        │       └── index.ts
        ├── proxies/                     # Controle de rotas público/privado
        │   ├── proxy-route.tsx          # Decide entre rota pública/privada
        │   ├── private-route.tsx        # Define as rotas autenticadas
        │   ├── public-route.tsx
        │   └── index.ts
        └── routes/
            ├── router.tsx               # Componente raiz com import dos estilos
            └── index.tsx                # Exporta GestaoLeads (entry MFE)
```

---

## Arquitetura em Camadas (Clean Architecture)

```
Usuário (Browser / Host MFE)
    ↕
main/ (composição, factories, roteamento)
    ↕
presentation/ (páginas, componentes, hooks de UI, constantes)
    ↕
data/ (serviços HTTP Axios, implementações de casos de uso)
    ↕
infra/ (adaptadores: LocalStorage)
    ↕
domain/ (modelos, contratos, erros — sem dependências externas)
```

**Princípio fundamental**: camadas internas **nunca** importam de camadas externas. O `domain/` não conhece nada além de si mesmo.

---

## Camada 1: `domain/` — Regras de negócio puras

**Responsabilidades**: Modelos de dados (`type`/`interface`), contratos de casos de uso, erros tipados. **Zero dependências de frameworks.**

**Exemplo — Modelo** (`src/domain/models/calendario-model.ts`):
```typescript
export type AgendamentoAtendimento = {
  id: number;
  cpfCliente: string;
  cliente: string;
  atendente: string;
  agendamento: Date | undefined | null;
  tipoAtendimento: string;
  comentario: string;
  status: string;
  idLoja: number;
};
```

**Exemplo — Contrato de caso de uso** (`src/domain/usecases/authentication.ts`):
```typescript
import { AccountModel } from "@/domain/models";

export interface Authentication {
  auth: (params: Authentication.Params) => Promise<Authentication.Model>;
}

export namespace Authentication {
  export type Params = {
    email: string;
    password: string[];
  };
  export type Model = AccountModel;
}
```

**Exemplo — Erro de domínio** (`src/domain/errors/invalid-credentials-error.ts`):
```typescript
export class InvalidCredentialsError extends Error {
  constructor(message?: string) {
    super(message ?? "Credenciais inválidas");
    this.name = "InvalidCredentialsError";
  }
}
```

---

## Camada 2: `data/` — Serviços HTTP e casos de uso

### 2a. Factory de cliente Axios por domínio (`src/data/services/api.ts`)

Cada domínio tem seu próprio cliente Axios com `baseURL` e headers específicos, incluindo interceptor para renovação de token OAuth:

```typescript
import axios from "axios";
import { getOAuthToken } from "./oauth-token-service";

export function createApiClientAgenda(token: string) {
  const client = axios.create({
    baseURL: process.env.API_BASE_URL_AGENDA,
    headers: {
      ...(token && { "x-access-token": token }),
    },
  });

  client.interceptors.request.use(async (config) => {
    const oauthToken = await getOAuthToken({
      clientId: process.env.GATEWAY_CLIENT_ID_AGENDA!,
      clientSecret: process.env.GATEWAY_CLIENT_SECRET_AGENDA!,
    });
    config.headers.Authorization = `Bearer ${oauthToken}`;
    return config;
  });

  return client;
}

export function createApiClientLeads(token: string) {
  // mesmo padrão com API_BASE_URL_LEADS e credenciais de Leads
}
```

### 2b. Serviços por domínio (`src/data/services/`)

**Padrão**: funções exportadas individualmente com comentários JSDoc e tratamento de erro explícito.

```typescript
// src/data/services/agendamento-service.ts
import axios from "axios";
import { createApiClientAgenda } from "./api";
import { AgendamentoAtendimento } from "@/domain/models/calendario-model";
import { getCurrentAccount } from "@bmg/arqf-auth";

const apiClient = createApiClientAgenda(getCurrentAccount().accessToken);

/**
 * Cadastra um novo agendamento.
 * @param data Dados do agendamento
 */
export const cadastrar = async (data: AgendamentoAtendimento) => {
  try {
    const response = await apiClient.post("/agendamentos/cadastrar", data);
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return { success: false, messages: ["Erro de validação"] };
    }
    throw error;
  }
};

/**
 * Atualiza um agendamento existente.
 */
export const atualizar = async (data: AgendamentoAtendimento) => {
  try {
    const response = await apiClient.put("/agendamentos/atualizar", data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    throw error;
  }
};

/**
 * Remove um agendamento pelo ID.
 */
export const deletar = async (id: number) => {
  try {
    const response = await apiClient.delete(`/agendamentos/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao deletar:", error);
    throw error;
  }
};
```

### 2c. Interface `IApiService` para o hook `useApi`

```typescript
// src/data/services/api-service-interface.ts

/** Abstração de uma service HTTP (Dependency Inversion). */
export interface IApiService<P, R> {
  buscar(payload: P, signal?: AbortSignal): Promise<R>;
}

/** Opções do hook useApi (Open-Closed). */
export interface UseApiOptions<P> {
  auto?: boolean;           // dispara automaticamente ao montar/alterar payload
  initialPayload?: P;       // payload inicial
  debounceMs?: number;      // evita disparos consecutivos
  retries?: number;         // tentativas extras (para 5xx/rede)
  keepPreviousData?: boolean; // mantém dados antigos enquanto carrega
}
```

### 2d. Implementação de caso de uso (`src/data/usecases/remote-authentication.ts`)

```typescript
import { HttpClient, HttpStatusCode } from "@bmg/arqf-api-client";
import { InvalidCredentialsError, UnexpectedError } from "@/domain/errors";
import { Authentication } from "@/domain/usecases";

export class RemoteAuthentication implements Authentication {
  constructor(
    private readonly url: string,
    private readonly httpClient: HttpClient,
  ) {}

  async auth(params: Authentication.Params): Promise<Authentication.Model> {
    const httpResponse = await this.httpClient.request({
      url: this.url,
      method: "post",
      body: params,
    });

    switch (httpResponse.statusCode) {
      case HttpStatusCode.ok:
      case HttpStatusCode.created:
        return httpResponse.body as Authentication.Model;
      case HttpStatusCode.unauthorized:
        throw new InvalidCredentialsError(httpResponse.message);
      default:
        throw new UnexpectedError(httpResponse.message);
    }
  }
}
```

---

## Camada 3: `infra/` — Adaptadores de infraestrutura

Implementações concretas dos protocolos definidos em `data/protocols/`.

```typescript
// src/infra/cache/local-storage-adapter.ts
import { SetStorage, GetStorage } from "@/data/protocols/cache";

export class LocalStorageAdapter implements SetStorage, GetStorage {
  set(key: string, value?: object): void {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }

  get<T = unknown>(key: string): T {
    return JSON.parse(`${localStorage.getItem(key)}`);
  }
}
```

---

## Camada 4: `presentation/` — UI e interação

### Estrutura de componente

```
/ComponentName/
├── index.tsx                # Componente principal (PascalCase no nome da pasta)
├── validation.ts            # Schema Yup (quando há formulário)
├── styles.ts                # Styled components (quando há estilos complexos)
├── component-name.module.css # CSS Module (para estilos simples/isolados)
└── status-enum.ts           # Enums (quando aplicável)
```

**Regras:**
- Pastas de componentes: **PascalCase** (`CreateAgendamento/`, `StatusAgenda/`)
- Arquivo principal: sempre `index.tsx`
- Estilos: use `styled-components` para layouts complexos, CSS Modules para estilos simples/isolados
- Constantes de UI: ficam em `presentation/constants/`, não dentro do componente

**Exemplo de componente com formulário** (`src/presentation/components/CreateAgendamento/index.tsx`):
```tsx
import { Box, Button, Input, Select } from "@bmg-genesis/components";
import { useFormik } from "formik";
import { schema } from "./validation";
import ErrorField from "@/presentation/components/ErrorField";
import { AgendamentoAtendimento } from "@/domain/models/calendario-model";
import { cadastrar, atualizar } from "@/data/services/agendamento-service";

interface CreateAgendamentoProps {
  onSave: (data: AgendamentoAtendimento) => void;
  selectedItem: AgendamentoAtendimento;
}

export function CreateAgendamento({ onSave, selectedItem }: CreateAgendamentoProps) {
  const formik = useFormik<AgendamentoAtendimento>({
    initialValues: { cpfCliente: "", cliente: "", /* ... */ },
    validationSchema: schema,
    onSubmit: async (values) => {
      const result = selectedItem.id
        ? await atualizar(values)
        : await cadastrar(values);
      if (result?.success) onSave(result.data);
    },
  });

  return (
    <Box>
      <Input
        label="CPF do cliente"
        value={formik.values.cpfCliente}
        onChange={formik.handleChange("cpfCliente")}
      />
      {formik.errors.cpfCliente && (
        <ErrorField message={formik.errors.cpfCliente} />
      )}
      <Button type="submit" onClick={() => formik.handleSubmit()}>
        Salvar
      </Button>
    </Box>
  );
}
```

**Validação Yup** (`src/presentation/components/CreateAgendamento/validation.ts`):
```typescript
import * as Yup from "yup";

export const schema = Yup.object({
  cpfCliente: Yup.string()
    .required("O campo é obrigatório.")
    .min(14, "CPF inválido."),
  agendamento: Yup.date()
    .required("O campo é obrigatório.")
    .min(new Date(), "Data/hora inválida."),
});
```

**Estilos com styled-components** (`styles.ts`):
```typescript
import styled from "styled-components";
import { Theme } from "@/presentation/styles/theme";

export const TableWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

export const IconSearch = styled.div`
  display: flex;
  cursor: pointer;
  background-color: ${Theme.colors.background};
`;
```

### Hook `useApi` — consumo tipado de serviços

```typescript
// src/presentation/hooks/useApi.ts
const {
  data: leadData,
  isLoading,
  setPayload,
} = useApi(consumirLeadsService, {
  auto: false,
  initialPayload: selectedLead,
  retries: 2,
  keepPreviousData: false,
});
```

**Responsabilidades do `useApi`:**
- Orquestrar estado (`data`, `isLoading`, `error`)
- Debounce para evitar disparos consecutivos
- Cancelamento via `AbortController`
- Retries com backoff exponencial para erros de rede/5xx

### Páginas (`presentation/pages/`)

Páginas são componentes React com estado, que orquestram chamadas a serviços e compõem componentes menores. **São expostas via Module Federation.**

```tsx
// src/presentation/pages/Prospeccao/index.tsx
import { useApi } from "@/presentation/hooks/useApi";
import { consumirLeadsService } from "@/data/services/lead-service";
import { buscarFeatureToggleLoja } from "@/data/services/featoggle-service";
import { getCurrentAccount, LegacyAccountModel } from "@bmg/arqf-auth";

export const FEATOGGLE = "FEATURE_TOGGLE_CNC_LEADS";

export function Prospeccao() {
  const currentAccount = getCurrentAccount() as LegacyAccountModel;
  const [featToggleOn, setFeatToggleOn] = useState<boolean | null>(null);

  const { data: leadData, isLoading, setPayload } = useApi(consumirLeadsService, {
    auto: featToggleOn || false,
    retries: 2,
    keepPreviousData: false,
  });

  useEffect(() => {
    async function featureToggleCheck() {
      const response = await buscarFeatureToggleLoja(
        FEATOGGLE,
        parseInt(currentAccount.identificadorLoja ?? "0"),
      );
      setFeatToggleOn(response.data?.valor ?? false);
    }
    featureToggleCheck();
  }, []);

  return (
    <Box>
      {/* Renderiza componentes passando dados e handlers */}
    </Box>
  );
}
```

### Constantes de UI (`presentation/constants/`)

```typescript
// src/presentation/constants/agendamento.constants.ts
export const AGENDAMENTO_PLACEHOLDER_TEXT = {
  TITLE: "Não há agendamento para esta data",
  MESSAGE: "Provavelmente, a loja não estará aberta ou é feriado.",
};
```

---

## Camada 5: `main/` — Composição e Injeção de Dependência

### Factories

O padrão **Factory** é usado para criar instâncias com dependências injetadas, desacoplando a `presentation/` de implementações concretas.

```typescript
// src/main/factories/http/http-client-factory.ts
import { ApiClient, httpClient } from "@bmg/arqf-api-client";
export const makeHttpClient = (): ApiClient => httpClient;

// src/main/factories/cache/local-storage-adapter-factory.ts
import { LocalStorageAdapter } from "@/infra/cache";
export const makeLocalStorageAdapter = () => new LocalStorageAdapter();

// src/main/factories/usecases/remote-authentication-factory.ts
import { makeHttpClient } from "@/main/factories/http";
import { RemoteAuthentication } from "@/data/usecases";
export const makeRemoteAuthentication = () =>
  new RemoteAuthentication("/auth/login", makeHttpClient());
```

### Adapters

```typescript
// src/main/adapters/current-account-adapter.ts
import { makeLocalStorageAdapter } from "@/main/factories/cache";
import { AccountModel } from "@/domain/models";

export const setCurrentAccountAdapter = (account: AccountModel): void =>
  makeLocalStorageAdapter().set("auth", account);

export const getCurrentAccountAdapter = (): AccountModel =>
  makeLocalStorageAdapter().get("auth");
```

### Rotas

```tsx
// src/main/proxies/private-route.tsx
import { Agendamento } from "@/presentation/pages/Agendamento";
import { BasePropria } from "@/presentation/pages/BasePropria";
import { Prospeccao } from "@/presentation/pages/Prospeccao";
import { Route, Routes } from "react-router-dom";

const PrivateRoute: React.FC = () => (
  <Routes>
    <Route path="/" element={<Prospeccao />} />
    <Route path="/base-propria" element={<BasePropria />} />
    <Route path="/agenda" element={<Agendamento />} />
  </Routes>
);
```

### Entry point do MFE (`src/main/routes/index.tsx`)

```tsx
import { default as Routes } from "./router";

export function GestaoLeads(): JSX.Element {
  return <Routes />;
}
```

---

## Module Federation — Exposições

As páginas e componentes expostos são declarados em `vite.config.ts`:

```typescript
federation({
  name: "mfeGestaoLeads",
  filename: "remoteEntry-[hash].js",
  manifest: true,
  exposes: {
    "./Agendamento":      "./src/presentation/pages/Agendamento",
    "./BasePropria":      "./src/presentation/pages/BasePropria",
    "./Prospeccao":       "./src/presentation/pages/Prospeccao",
    "./CreateAgendamento": "./src/presentation/components/CreateAgendamento",
  },
  runtimePlugins: ["./plugins/mfPlugins", "./plugins/sharedStrategy"],
  shared: {
    react:                            { requiredVersion: pkg.dependencies.react },
    "react-dom":                      { requiredVersion: pkg.dependencies["react-dom"] },
    "react-router-dom":               { requiredVersion: pkg.dependencies["react-router-dom"] },
    "zustand":                        { requiredVersion: pkg.dependencies.zustand },
    "@bmg-genesis/components":        { requiredVersion: pkg.dependencies["@bmg-genesis/components"] },
    "@bmg/arqf-feature-toggle-permission": { requiredVersion: "..." },
  },
})
```

**Pontos de atenção:**
- Ao adicionar nova página/componente exposto: declare no `exposes` do `vite.config.ts`
- Variáveis de ambiente separadas por cliente HTTP: `VITE_API_URL_AGENDA`, `VITE_API_URL_LEADS`
- A porta é gerada deterministicamente por `generatePort(packageName)` — não altere o nome do pacote sem verificar colisões
- O arquivo `app.tsx` é usado **apenas em desenvolvimento local** — o host consome via `GestaoLeads` exportado em `main/routes/index.tsx`

---

## Desenvolvimento de nova feature

### Checklist — Processo em 5 etapas

Para uma feature chamada "Oportunidades":

#### Etapa 1 — Modelo de domínio (`src/domain/models/oportunidade-model.ts`)

```typescript
export type OportunidadeModel = {
  id: number;
  cpfCliente: string;
  produto: string;
  valor: number;
  status: "aberta" | "convertida" | "perdida";
  dataExpiracao: string;
};

export type OportunidadeRequest = {
  codigoLoja: number;
  produto?: string;
};
```

#### Etapa 2 — Serviço HTTP (`src/data/services/oportunidade-service.ts`)

```typescript
import { getCurrentAccount } from "@bmg/arqf-auth";
import { createApiClientLeads } from "./api";
import { OportunidadeModel, OportunidadeRequest } from "@/domain/models/oportunidade-model";

const apiClient = createApiClientLeads(getCurrentAccount().accessToken);

/**
 * Busca oportunidades disponíveis para a loja.
 */
export const buscarOportunidades = async (
  request: OportunidadeRequest,
): Promise<OportunidadeModel[]> => {
  try {
    const response = await apiClient.get(
      `/oportunidades/${request.codigoLoja}`,
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar oportunidades:", error);
    throw error;
  }
};

/**
 * Converte uma oportunidade em atendimento.
 */
export const converterOportunidade = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/oportunidades/${id}/converter`, {});
  } catch (error) {
    console.error("Erro ao converter oportunidade:", error);
    throw error;
  }
};
```

#### Etapa 3 — Interface `IApiService` (quando usar `useApi`)

```typescript
// src/data/services/oportunidade-api-service.ts
import { IApiService } from "./api-service-interface";
import { OportunidadeModel, OportunidadeRequest } from "@/domain/models/oportunidade-model";
import { getCurrentAccount } from "@bmg/arqf-auth";
import { createApiClientLeads } from "./api";

const apiClient = createApiClientLeads(getCurrentAccount().accessToken);

export const oportunidadeApiService: IApiService<OportunidadeRequest, OportunidadeModel[]> = {
  buscar(payload: OportunidadeRequest) {
    return apiClient
      .get<OportunidadeModel[]>(`/oportunidades/${payload.codigoLoja}`)
      .then((r) => r.data);
  },
};
```

#### Etapa 4 — Componente (`src/presentation/components/CardOportunidade/`)

```tsx
// src/presentation/components/CardOportunidade/index.tsx
import { Box, Text, Button, Badge } from "@bmg-genesis/components";
import { OportunidadeModel } from "@/domain/models/oportunidade-model";
import { converterOportunidade } from "@/data/services/oportunidade-service";

interface CardOportunidadeProps {
  oportunidade: OportunidadeModel;
  onConvertida: () => void;
}

export function CardOportunidade({ oportunidade, onConvertida }: CardOportunidadeProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConverter = async () => {
    setIsLoading(true);
    try {
      await converterOportunidade(oportunidade.id);
      onConvertida();
    } catch (error) {
      console.error("Erro ao converter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap="$xs">
      <Text>{oportunidade.cpfCliente}</Text>
      <Text>{oportunidade.produto}</Text>
      <Button onClick={handleConverter} disabled={isLoading}>
        {isLoading ? "Convertendo..." : "Converter"}
      </Button>
    </Box>
  );
}
```

#### Etapa 5 — Página (`src/presentation/pages/Oportunidades/`)

```tsx
// src/presentation/pages/Oportunidades/index.tsx
import { useApi } from "@/presentation/hooks/useApi";
import { oportunidadeApiService } from "@/data/services/oportunidade-api-service";
import { CardOportunidade } from "@/presentation/components/CardOportunidade";
import { getCurrentAccount, LegacyAccountModel } from "@bmg/arqf-auth";
import { Box, Title } from "@bmg-genesis/components";
import { OportunidadeRequest } from "@/domain/models/oportunidade-model";

export function Oportunidades() {
  const currentAccount = getCurrentAccount() as LegacyAccountModel;

  const initialPayload: OportunidadeRequest = {
    codigoLoja: parseInt(currentAccount.identificadorLoja ?? "0"),
  };

  const { data: oportunidades = [], isLoading, refetch } = useApi(
    oportunidadeApiService,
    { auto: true, initialPayload },
  );

  if (isLoading) return <Box>Carregando...</Box>;

  return (
    <Box display="flex" flexDirection="column" gap="$xs">
      <Title as="h3">Oportunidades</Title>
      {oportunidades.map((op) => (
        <CardOportunidade
          key={op.id}
          oportunidade={op}
          onConvertida={refetch}
        />
      ))}
    </Box>
  );
}
```

**Se a página deve ser exposta via MFE**, adicione em `vite.config.ts`:
```typescript
exposes: {
  // ... existentes
  "./Oportunidades": "./src/presentation/pages/Oportunidades",
},
```

E adicione a rota em `src/main/proxies/private-route.tsx`:
```tsx
<Route path="/oportunidades" element={<Oportunidades />} />
```

---

## Testes unitários

**Stack**: Jest + React Testing Library + `@ngneat/falso` (dados fake)

**Localização dos testes**: arquivo `.spec.ts` no mesmo nível do arquivo testado (ex: `remote-authentication.spec.ts` ao lado de `remote-authentication.ts`)

**Exceção para cobertura**: `src/main/**` é excluído da cobertura (camada de composição).

### Exemplo — teste de caso de uso

```typescript
// src/data/usecases/remote-authentication.spec.ts
import * as faker from "@ngneat/falso";
import { RemoteAuthentication } from "./remote-authentication";
import { HttpClientSpy, HttpStatusCode } from "@bmg/arqf-api-client";
import { InvalidCredentialsError, UnexpectedError } from "@/domain/errors";
import { mockAuthenticationParams } from "@/domain/mocks";

type SutTypes = {
  sut: RemoteAuthentication;
  httpClientSpy: HttpClientSpy<RemoteAuthentication.Model>;
};

const makeSut = (url: string = faker.randUrl()): SutTypes => {
  const httpClientSpy = new HttpClientSpy<RemoteAuthentication.Model>();
  const sut = new RemoteAuthentication(url, httpClientSpy);
  return { sut, httpClientSpy };
};

describe("RemoteAuthentication", () => {
  it("deve chamar o HttpClient com os valores corretos", async () => {
    // Arrange
    const url = faker.randUrl();
    const { sut, httpClientSpy } = makeSut(url);
    const params = mockAuthenticationParams();

    // Act
    await sut.auth(params);

    // Assert
    expect(httpClientSpy.url).toBe(url);
    expect(httpClientSpy.method).toBe("post");
    expect(httpClientSpy.body).toEqual(params);
  });

  it("deve lançar InvalidCredentialsError quando HttpClient retornar 401", async () => {
    // Arrange
    const { sut, httpClientSpy } = makeSut();
    httpClientSpy.response = { statusCode: HttpStatusCode.unauthorized };

    // Act & Assert
    await expect(sut.auth(mockAuthenticationParams())).rejects.toThrow(
      new InvalidCredentialsError(),
    );
  });
});
```

### Exemplo — teste de infra

```typescript
// src/infra/cache/local-storage-adapter.spec.ts
import { LocalStorageAdapter } from "./local-storage-adapter";

const makeSut = () => new LocalStorageAdapter();

describe("LocalStorageAdapter", () => {
  it("deve salvar e recuperar valor do localStorage", () => {
    // Arrange
    const sut = makeSut();
    const key = "test-key";
    const value = { foo: "bar" };

    // Act
    sut.set(key, value);
    const result = sut.get(key);

    // Assert
    expect(result).toEqual(value);
  });

  it("deve remover item quando value for undefined", () => {
    // Arrange
    const sut = makeSut();
    const key = "test-key";
    sut.set(key, { data: "temp" });

    // Act
    sut.set(key, undefined);

    // Assert
    expect(localStorage.getItem(key)).toBeNull();
  });
});
```

---

## Boas práticas

### ✅ Fazer

- Chamar `getCurrentAccount()` somente em `data/services/` (na inicialização do cliente Axios) ou em `presentation/pages/`
- Usar `useApi` para consumo de services que implementam `IApiService<P, R>`
- Usar chamadas diretas (`cadastrar`, `buscar`) para operações imperativas (submit de formulários, delete)
- Escrever comentários JSDoc em **português do Brasil** nos serviços
- Código sempre em **inglês** (variáveis, funções, interfaces)
- Validar Feature Toggle **antes** de exibir dados ou habilitar funcionalidades
- Tratar erros Axios com `axios.isAxiosError(error)` e retornar shape consistente `{ success, data?, messages? }`
- Usar `@bmg-genesis/components` para todos os elementos de UI
- Seguir padrão Triple A (Arrange, Act, Assert) nos testes
- Usar `makeSut` como factory de System Under Test nos testes

### ❌ Não fazer

- Importar `axios` diretamente em `presentation/` (use os serviços de `data/`)
- Criar estado global Zustand para dados de servidor (não há React Query neste projeto)
- Chamar serviços HTTP fora de `data/services/`
- Colocar validações Yup inline no componente (extrair para `validation.ts`)
- Colocar styled components inline no componente (extrair para `styles.ts`)
- Ignorar erros TypeScript com `// @ts-ignore` ou `any` sem necessidade
- Testar detalhes de implementação (testar comportamento e contratos)
- Criar novas dependências fora da stack definida sem alinhamento

---

## Convenções de nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Pasta de página / componente | PascalCase | `Agendamento/`, `CreateAgendamento/` |
| Arquivo de componente / página | `index.tsx` | `CreateAgendamento/index.tsx` |
| Arquivo de serviço | kebab-case + `-service.ts` | `agendamento-service.ts` |
| Arquivo de validação | `validation.ts` | `CreateAgendamento/validation.ts` |
| Arquivo de estilos styled | `styles.ts` | `Agendamento/styles.ts` |
| CSS Module | `component-name.module.css` | `luckybutton.module.css` |
| Arquivo de enum | `nome-enum.ts` | `status-enum.ts` |
| Arquivo de constantes | `nome.constants.ts` | `agendamento.constants.ts` |
| Arquivo de teste | `.spec.ts` | `remote-authentication.spec.ts` |
| Componente React | PascalCase | `CreateAgendamento`, `StatusAgenda` |
| Função de serviço | camelCase (pt-BR descritivo) | `cadastrar`, `buscarAtendentes` |
| Hook | `use` + PascalCase | `useApi` |
| Constante | UPPER_SNAKE_CASE | `FEATOGGLE`, `AGENDAMENTO_PLACEHOLDER_TEXT` |
| Type / Interface de modelo | PascalCase + `Model`/`Request`/`Response` | `AgendamentoModel`, `LeadsRequest` |
| Interface de serviço | `I` + PascalCase | `IApiService` |
| Factory | `make` + PascalCase | `makeHttpClient`, `makeRemoteAuthentication` |

---

## Scripts disponíveis

```bash
yarn dev                  # Desenvolvimento (modo dev)
yarn dev:hml              # Desenvolvimento (modo staging)
yarn build                # Build modo dev
yarn build:hml            # Build staging
yarn build:prd            # Build produção
yarn test                 # Roda testes unitários
yarn test:coverage        # Testes com coverage
yarn lint                 # Lint (máx 10 warnings)
yarn types:check          # Verifica tipos TypeScript
```

## Path aliases

```typescript
"@/*"  → "src/*"
```

---

## Dependências principais

| Pacote | Uso |
|---|---|
| `@bmg-genesis/components` | Design System (UI components) |
| `@bmg-genesis/icons` | Ícones do Design System |
| `@bmg/arqf-api-client` | HttpClient base para `RemoteAuthentication` |
| `@bmg/arqf-auth` | `getCurrentAccount`, `LegacyAccountModel`, auth state |
| `@bmg/arqf-feature-toggle-permission` | Feature flags e permissões por rota |
| `@bmg/arqf-validator` | Validadores compartilhados |
| `@bmg/web-cross` | `TokensProvider` (design tokens) |
| `axios` | Cliente HTTP dos serviços de `data/services/` |
| `formik` + `yup` | Formulários com validação declarativa |
| `styled-components` | CSS-in-JS para estilos complexos |
| `react-router-dom` | Roteamento SPA |
| `zustand` | Estado global (usado via dependência compartilhada do host) |

---

## Troubleshooting

**`getCurrentAccount()` retorna null em teste**: Mockar `@bmg/arqf-auth` no topo do arquivo de teste:
```typescript
jest.mock("@bmg/arqf-auth", () => ({
  getCurrentAccount: jest.fn(() => ({ accessToken: "mock-token" })),
}));
```

**Erro de CORS com API local**: Verificar `VITE_API_URL_AGENDA` / `VITE_API_URL_LEADS` no `.env.dev`.

**Feature Toggle sempre `false`**: Verificar se `identificadorLoja !== "0"` — lojas com ID `"0"` não consultam feature toggle.

**Token OAuth expirado em testes E2E**: O `oauth-token-service.ts` tem cache em memória — em testes, mockar o módulo inteiro.

**Componente não aparece no host**: Verificar se a página está declarada em `exposes` no `vite.config.ts` e se o `mf-manifest.json` foi regenerado com `yarn build`.

**`@/` não resolve em Jest**: Verificar `moduleNameMapper` no `jest.config.mjs`:
```javascript
"@/(.*)": "<rootDir>/src/$1"
```
