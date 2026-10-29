# @relay-sdk/react-native

Official [Relay](https://sendrelay.com.ng) React Native bindings: show a delivery's status, the rider on a map and a live arrival time in iOS and Android apps. Works with Expo.

```bash
npm install @relay-sdk/react-native
```

```tsx
import { RelayProvider, useTaskTracker, useEtaCountdown } from '@relay-sdk/react-native';

export function App() {
  return (
    // Your server mints the token with its API key. Pass a deviceId you persist, such as an install ID.
    <RelayProvider getToken={(taskIds) => api.trackingToken(taskIds)} deviceId={installId}>
      <OrderScreen taskId="..." />
    </RelayProvider>
  );
}

function OrderScreen({ taskId }: { taskId: string }) {
  const { status, rider, eta } = useTaskTracker(taskId);
  const secondsLeft = useEtaCountdown(eta);
  return <Text>{status ?? 'Finding a rider'}{secondsLeft !== null ? ` · ${Math.ceil(secondsLeft / 60)} min away` : ''}</Text>;
}
```

The same hooks as `@relay-sdk/react`. The provider also reconnects when the app returns to the foreground, since iOS and Android close sockets in the background.

[Full documentation](https://docs.sendrelay.com.ng/sdks/react-native-sdk)
