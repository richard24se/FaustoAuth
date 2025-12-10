import { createSystem, defaultConfig, defineConfig, defineRecipe, defineSlotRecipe } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: 'var(--chakra-colors-primary-50)' },
          100: { value: 'var(--chakra-colors-primary-100)' },
          200: { value: 'var(--chakra-colors-primary-200)' },
          300: { value: 'var(--chakra-colors-primary-300)' },
          400: { value: 'var(--chakra-colors-primary-400)' },
          500: { value: 'var(--chakra-colors-primary-500)' },
          600: { value: 'var(--chakra-colors-primary-600)' },
          700: { value: 'var(--chakra-colors-primary-700)' },
          800: { value: 'var(--chakra-colors-primary-800)' },
          900: { value: 'var(--chakra-colors-primary-900)' },
        },
        secondary: {
          50: { value: 'var(--chakra-colors-secondary-50)' },
          100: { value: 'var(--chakra-colors-secondary-100)' },
          500: { value: 'var(--chakra-colors-secondary-500)' },
          600: { value: 'var(--chakra-colors-secondary-600)' },
          900: { value: 'var(--chakra-colors-secondary-900)' },
        },
        accent: {
          50: { value: 'var(--chakra-colors-accent-50)' },
          100: { value: 'var(--chakra-colors-accent-100)' },
          500: { value: 'var(--chakra-colors-accent-500)' },
          600: { value: 'var(--chakra-colors-accent-600)' },
          900: { value: 'var(--chakra-colors-accent-900)' },
        },
        success: {
          50: { value: 'var(--chakra-colors-success-50)' },
          100: { value: 'var(--chakra-colors-success-100)' },
          500: { value: 'var(--chakra-colors-success-500)' },
          600: { value: 'var(--chakra-colors-success-600)' },
          900: { value: 'var(--chakra-colors-success-900)' },
        },
        warning: {
          50: { value: 'var(--chakra-colors-warning-50)' },
          100: { value: 'var(--chakra-colors-warning-100)' },
          500: { value: 'var(--chakra-colors-warning-500)' },
          600: { value: 'var(--chakra-colors-warning-600)' },
          900: { value: 'var(--chakra-colors-warning-900)' },
        },
        surface: {
          500: { value: 'var(--chakra-colors-surface-500)' },
        }
      }
    },
    semanticTokens: {
      colors: {
        primary: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "#ffffff" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
    slotRecipes: {
      menu: defineSlotRecipe({
        slots: ["item", "content"],
        base: {
          content: {
            borderRadius: "md",
            boxShadow: "lg",
            p: 1,
            bg: "white",
            _dark: { bg: "gray.800" }
          },
          item: {
            borderRadius: "sm",
            cursor: "pointer",
            _hover: {
              bg: "brand.50",
              color: "brand.700",
              _dark: {
                 bg: "brand.900/20",
                 color: "brand.200",
              }
            },
            _focus: {
              bg: "brand.50",
              color: "brand.700",
              _dark: {
                 bg: "brand.900/20",
                 color: "brand.200",
              }
            },
          },
        },
      }),
      popover: defineSlotRecipe({
        slots: ["content", "header", "body", "arrow", "closeTrigger"],
        base: {
          content: {
            borderRadius: "md",
            boxShadow: "xl",
            bg: "white",
            border: "1px solid",
            borderColor: "gray.200",
            _dark: { 
              bg: "gray.800",
              borderColor: "gray.700" 
            }
          },
          header: {
            fontWeight: "bold",
            borderBottomWidth: "1px",
            borderColor: "gray.100",
            _dark: { borderColor: "gray.700" },
            p: 4,
          },
          body: {
            p: 4,
          },
        },
      }),
    },
    recipes: {
      button: defineRecipe({
        base: {
          fontWeight: "bold",
          borderRadius: "md",
          colorPalette: "brand",
        },
        variants: {
          variant: {
             solid: {
                bg: "colorPalette.500",
                color: "white",
                _hover: {
                  bg: "colorPalette.600",
                },
             },
             outline: {
                border: "2px solid",
                borderColor: "colorPalette.500",
                color: "colorPalette.500",
                _hover: {
                  bg: "colorPalette.50",
                },
             },
             ghost: {
                color: "colorPalette.500",
                _hover: {
                  bg: "colorPalette.50",
                },
             },
             link: {
                color: "colorPalette.500",
                _hover: {
                  textDecoration: "underline",
                },
             }
          },
        },
        defaultVariants: {
          variant: "solid",
        },
      }),
    },
  },
  globalCss: {
    body: {
      bg: 'var(--chakra-colors-bg-500)',
      color: { base: 'gray.800', _dark: 'whiteAlpha.900' },
    },
  },
})

export default createSystem(defaultConfig, config)
