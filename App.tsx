import { ResponsiveAIAssistant } from "./components/ResponsiveAIAssistant";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "./src/i18n";

export default function App() {
  return (
    <I18nProvider>
      <ResponsiveAIAssistant />
      <Toaster position="top-center" theme="dark" />
    </I18nProvider>
  );
}
