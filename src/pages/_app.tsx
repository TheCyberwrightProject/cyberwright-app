import "@mantine/core/styles.css";

import type { AppProps } from "next/app";
import { createTheme, MantineProvider } from "@mantine/core";
import "../styles/globals.css";
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import Navbar from "@/components/Navbar";

const theme = createTheme({
  colors: {
    green: [
      "#e6fff7",
      "#d2fcef",
      "#a5f8de",
      "#74f5cc",
      "#50f3bd",
      "#3bf1b4",
      "#2df0ae",
      "#1fd698",
      "#0bbe86",
      "#00a572",
    ],
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <Navbar />
      <Component {...pageProps} />
    </MantineProvider>
  );
}
