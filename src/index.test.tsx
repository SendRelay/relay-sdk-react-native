import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const appState = vi.hoisted(() => ({ listener: null as null | ((state: string) => void), removed: 0 }));
vi.mock('react-native', () => ({
  AppState: {
    addEventListener: (_event: string, listener: (state: string) => void) => {
      appState.listener = listener;
      return { remove: () => appState.removed++ };
    },
  },
}));

const { RelayProvider, useTaskTracker } = await import('./index');

function fakeClient() {
  const handlers = new Map<string, Set<(payload: any) => void>>();
  return {
    on: vi.fn((event: string, handler: (payload: any) => void) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
      return () => handlers.get(event)!.delete(handler);
    }),
    emit(event: string, payload: any) {
      for (const handler of handlers.get(event) ?? []) handler(payload);
    },
    listen: vi.fn(async () => {}),
    stopListening: vi.fn(async () => {}),
    getListeningTo: vi.fn(() => ['t1']),
    isConnected: vi.fn(() => false),
    connect: vi.fn(async () => {}),
  };
}

describe('React Native RelayProvider', () => {
  it('tracks with the React hooks and reconnects when the app returns to the foreground', async () => {
    const client = fakeClient();
    function Order() {
      const { status, eta } = useTaskTracker('t1');
      return <p>{`${status ?? 'waiting'} ${eta ? `${eta.seconds}s` : 'no-eta'}`}</p>;
    }
    const view = render(
      <RelayProvider client={client as any}>
        <Order />
      </RelayProvider>,
    );
    await act(async () => {});
    act(() => {
      client.emit('TASK_ASSIGNED', { taskId: 't1', status: 'ASSIGNED', currentStageIndex: 0 });
      client.emit('RIDER_LOCATION_UPDATE', {
        taskId: 't1',
        location: { latitude: 6.45, longitude: 3.39 },
        eta: { stageIndex: 0, seconds: 240, meters: 1200 },
        timestamp: new Date().toISOString(),
      });
    });
    expect(screen.getByText('ASSIGNED 240s')).toBeTruthy();

    appState.listener!('background');
    expect(client.connect).not.toHaveBeenCalled();
    appState.listener!('active');
    expect(client.connect).toHaveBeenCalledTimes(1);

    client.isConnected.mockReturnValue(true);
    appState.listener!('active');
    expect(client.connect).toHaveBeenCalledTimes(1);

    view.unmount();
    expect(appState.removed).toBe(1);
  });
});
