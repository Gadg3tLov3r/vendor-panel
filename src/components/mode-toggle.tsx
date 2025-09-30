import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] transition-all hidden dark:block" />
      <Moon className="h-[1.2rem] w-[1.2rem] dark:hidden transition-all" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
