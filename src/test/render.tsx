import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';

/** Render a component inside the providers the app uses (React Query + Router). */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', extraRoutes }: { route?: string; extraRoutes?: ReactElement } = {}
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={route} element={ui} />
          {extraRoutes}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
