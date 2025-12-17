import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";

type Theme = (typeof Colors)["light"] | (typeof Colors)["dark"];

interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  colorScheme: "light" | "dark";
}

export function useTheme(): UseThemeResult {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  return {
    theme,
    isDark,
    colorScheme: colorScheme ?? "light",
  };
}
