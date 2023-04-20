import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export const useSettingsStore = create<
  Settings,
  [["zustand/devtools", never], ["zustand/persist", ScoreSetting]]
>(
  devtools(
    persist(
      (set, get) => ({
        isCheckingUpdate: false,

        setIsCheckingUpdate: (val: boolean) => {
          set({ isCheckingUpdate: val });
        },
      }),
      {
        name: "settings-storage",
        // getStorage: () => localStorage,
      }
    )
  )
);
