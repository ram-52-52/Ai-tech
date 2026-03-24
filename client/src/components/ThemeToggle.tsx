import { Moon, Sun } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative rounded-full h-10 w-10 overflow-hidden bg-background/50 hover:bg-background/80 transition-all border border-border shrink-0"
    >
      <Sun className="h-5 w-5 absolute transition-all dark:-translate-y-full dark:opacity-0" />
      <Moon className="h-5 w-5 absolute transition-all translate-y-full opacity-0 dark:translate-y-0 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
