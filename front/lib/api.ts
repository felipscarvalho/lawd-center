import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { useUserStore } from "@/stores/user_store";

/** Erro normalizado da API, no mesmo formato para qualquer falha */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string | null,
    /** Erros de validação por campo (VineJS), ex.: { email: "Já existe" } */
    public fieldErrors: Record<string, string>,
  ) {
    super(message);
  }
}

interface BackendErrorBody {
  errors?: { message: string; code?: string; field?: string }[];
}

// Único ponto do front que conversa com o axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1",
  headers: { Accept: "application/json" },
});

// Envia o token da sessão em todas as requisições
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorBody>) => {
    const status = error.response?.status ?? 0;
    const errors = error.response?.data?.errors ?? [];

    // Sessão expirada ou revogada: limpa o token e volta para o login com recarga completa
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (status === 401 && !isLoginRequest && typeof window !== "undefined") {
      useUserStore.getState().clear();
      // Recarga completa de propósito: limpa o estado que o Next mantém nas rotas montadas
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }

    const fieldErrors = Object.fromEntries(
      errors.filter((item) => item.field).map((item) => [item.field as string, item.message]),
    );
    const message =
      status === 0
        ? "Não foi possível conectar ao servidor"
        : (errors[0]?.message ?? "Ocorreu um erro inesperado");

    return Promise.reject(new ApiError(message, status, errors[0]?.code ?? null, fieldErrors));
  },
);

// Atalhos dos services: o backend responde { data: ... } e eles já devolvem o conteúdo de `data`

async function unwrap<T>(request: Promise<AxiosResponse<{ data: T }>>): Promise<T> {
  const response = await request;

  return response.data.data;
}

export const apiGet = <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(api.get(url, config));

export const apiPost = <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
  unwrap<T>(api.post(url, body, config));

export const apiPut = <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
  unwrap<T>(api.put(url, body, config));

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(api.delete(url, config));

/** Paginação das listas do backend (paginator do Lucid) */
export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

/** Resposta paginada: os itens em `data` e a paginação em `metadata` */
export interface Paginated<T> {
  data: T[];
  metadata: PaginationMeta;
}

/** Atalho para listas paginadas: devolve os itens junto com a paginação */
export const apiGetPage = async <T>(url: string, config?: AxiosRequestConfig) => {
  const response = await api.get<Paginated<T>>(url, config);

  return response.data;
};
