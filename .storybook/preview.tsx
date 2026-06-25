import type { Preview } from "@storybook/react-vite";
// import "./theming/direct-channel/direct-channel.scss";
import "./theming.css";
import React, { useEffect } from "react";
import { ModalService } from "../src/core/Modal/ModalService";

// Global modal cleanup function
const closeAllModals = async () => {
  ModalService.closeLoadingModal();
  ModalService.closeConfirmModal();
  ModalService.closeErrorModal();
  // Small delay to ensure cleanup
  await new Promise((resolve) => setTimeout(resolve, 100));
};

// Wrapper component that handles modal cleanup
const ModalCleanupWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Close all modals when component mounts (before each story)
    closeAllModals();
  }, []);

  return (
    <div
      className={"react-container"}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div id="modal-root"></div>
      {children}
    </div>
  );
};
const preview: Preview = {
  parameters: {
    docs: {
      toc: true, // 👈 Enables the table of contents
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Canvas background is driven by the Theme toggle (var(--fn-bg)),
    // so disable the separate Backgrounds addon control to avoid confusion.
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: "Color scheme (overrides OS preference for light-dark())",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story: any, context: any) => {
      const theme = context.globals.theme;
      // Force light-dark() resolution regardless of the OS preference, and
      // make the canvas background follow the same theme token.
      useEffect(() => {
        document.documentElement.style.colorScheme = theme;
        document.body.style.background = "var(--fn-bg)";
      }, [theme]);

      return (
        <div
          style={{
            background: "var(--fn-bg)",
            color: "var(--fn-fg)",
            minHeight: "100vh",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  tags: ["autodocs"],
};

export default preview;
