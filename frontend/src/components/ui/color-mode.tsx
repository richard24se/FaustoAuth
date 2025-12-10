import { createContext, useContext, useEffect, useState } from "react"
import { IconButton, IconButtonProps } from "@chakra-ui/react"
import { FiMoon, FiSun } from "react-icons/fi"

type ColorMode = "light" | "dark"

interface ColorModeContextType {
  colorMode: ColorMode
  toggleColorMode: () => void
  setColorMode: (mode: ColorMode) => void
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined)

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>("light")

  useEffect(() => {
    const saved = localStorage.getItem("chakra-ui-color-mode") as ColorMode | null
    if (saved) {
        setColorMode(saved)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setColorMode("dark")
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(colorMode)
    root.style.colorScheme = colorMode
    localStorage.setItem("chakra-ui-color-mode", colorMode)
  }, [colorMode])

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode, setColorMode }}>
      {children}
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  const context = useContext(ColorModeContext)
  if (!context) throw new Error("useColorMode must be used within ColorModeProvider")
  return context
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "light" ? light : dark
}

export function ColorModeButton(props: IconButtonProps) {
  const { toggleColorMode, colorMode } = useColorMode()
  return (
    <IconButton
      onClick={toggleColorMode}
      variant="ghost"
      aria-label="Toggle color mode"
      {...props}
    >
      {colorMode === "light" ? <FiSun /> : <FiMoon />}
    </IconButton>
  )
}
