/**
 * Official Relay React Native bindings. Same hooks as `@relay-sdk/react` (`useTaskTracker`,
 * `useEtaCountdown`), plus a provider that reconnects when the app comes back to the foreground,
 * since iOS and Android close sockets in the background.
 *
 * Works with Expo and bare React Native; React Native's built-in WebSocket is used.
 *
 * @packageDocumentation
 */

import { RelayProvider as WebRelayProvider, useRelayClient, type RelayProviderProps } from '@relay-sdk/react';
import { useEffect } from 'react';
import { AppState } from 'react-native';

export * from '@relay-sdk/react';

/**
 * Makes one realtime client available to every hook below it, and reconnects it when the app
 * returns to the foreground.
 *
 * Tip: pass a `deviceId` you persist (for example with AsyncStorage) so the server sees the same
 * device across app launches. Without one, a random ID is used per launch.
 *
 * @example
 * ```tsx
 * <RelayProvider getToken={(taskIds) => api.trackingToken(taskIds)} deviceId={installId}>
 *   <OrderScreen />
 * </RelayProvider>
 * ```
 */
export function RelayProvider(props: RelayProviderProps) {
  return (
    <WebRelayProvider {...props}>
      <ReconnectOnForeground />
      {props.children}
    </WebRelayProvider>
  );
}

function ReconnectOnForeground() {
  const client = useRelayClient();
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && client.getListeningTo().length > 0 && !client.isConnected()) {
        // Errors surface through CONNECTION_ERROR and the tracker's `error`.
        client.connect().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [client]);
  return null;
}
