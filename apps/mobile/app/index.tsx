import App from "../src/App";
import { AuthGate } from "../src/components/auth/AuthGate";

export default function Page() {
  return (
    <AuthGate>
      <App />
    </AuthGate>
  );
}
