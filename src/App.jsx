import AppRouter from "./app/router/AppRouter";
import { AppStoreProvider } from "./shared/context/AppStore";

function App() {
  return (
    <AppStoreProvider>
      <AppRouter />
    </AppStoreProvider>
  );
}

export default App;
