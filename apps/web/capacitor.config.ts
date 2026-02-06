import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hampstead.ondemand",
  appName: "Hampstead On Demand",
  webDir: "out",
  server: {
    // In production, load from the deployed URL
    url: "https://hampstead-on-demand-v1.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#fafaf9",
    scheme: "Hampstead On Demand",
  },
  android: {
    backgroundColor: "#fafaf9",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#fafaf9",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1c1917",
    },
  },
};

export default config;
