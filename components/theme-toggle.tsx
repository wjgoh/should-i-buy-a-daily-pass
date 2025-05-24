"use client";

import { Heart, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [clickCount, setClickCount] = useState(0);

  const handleThemeButtonClick = useCallback(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Check for Easter egg activation (5 clicks)
    if (newCount === 5) {
      setTheme("pink");
      toast.success("🎉 Pink mode activated!", {
        description: "You found the Easter egg! Enjoy the pink theme!",
        icon: "💖",
      });
      setClickCount(0);
    }
  }, [clickCount, setTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={handleThemeButtonClick}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 pink:-rotate-90 pink:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 pink:rotate-90 pink:scale-0" />
          <Heart
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all pink:rotate-0 pink:scale-100"
            fill="#AA60C8"
            stroke="#AA60C8"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>{" "}
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
