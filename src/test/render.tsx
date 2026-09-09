import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';

/**
 * Render a component inside the providers the app uses (React Query + Router).
 * `route` is the URL to visit; `path` is the route pattern (defaults to `route`),
 * e.g. route '/verify-email/abc' with path '/verify-email/:token'.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    path = route,
    extraRoutes,
  }: { route?: string; path?: string; extraRoutes?: ReactElement } = {}
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          {extraRoutes}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
