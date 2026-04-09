type RequestConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
};

const buildUrl = (
  baseUrl: string,
  path: string,
  params?: RequestConfig['params'],
) => {
  const url = new URL(path, `${baseUrl.replace(/\/$/, '')}/`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: Record<string, string> = {},
  ) {}

  async get<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const response = await fetch(buildUrl(this.baseUrl, path, config.params), {
      headers: {
        Accept: 'application/json',
        ...this.defaultHeaders,
        ...config.headers,
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
