import { Stack } from "expo-router";
import { ContactProvider } from "../context/ContactContext";

export default function RootLayout() {
  return (
    <ContactProvider>
      <Stack />
    </ContactProvider>
  );
}
