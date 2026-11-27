// Generated from the host-tokens registry item by scripts/build-portable-styles.mjs.
const containerQueries = require("@tailwindcss/container-queries")

const colorVariables = {
  "host-app-surface": "var(--mb-surface, var(--color-background-primary))",
  "host-app-surface-muted": "var(--mb-surface-muted, var(--color-background-secondary))",
  "host-app-surface-subtle": "var(--mb-surface-muted, var(--color-background-tertiary))",
  "host-app-fg": "var(--mb-fg, var(--color-text-primary))",
  "host-app-fg-muted": "var(--mb-fg-muted, var(--color-text-secondary))",
  "host-app-fg-subtle": "var(--mb-fg-muted, var(--color-text-tertiary))",
  "host-app-border": "var(--mb-border, var(--color-border-primary))",
  "host-app-border-muted": "var(--mb-border, var(--color-border-secondary))",
  "host-app-border-subtle": "var(--mb-border, var(--color-border-tertiary))",
  "host-app-accent": "var(--mb-accent, var(--color-background-inverse))",
  "host-app-accent-fg": "var(--mb-accent-fg, var(--color-text-inverse))",
  "host-app-info-bg": "var(--mb-info-bg, var(--color-background-info))",
  "host-app-info-fg": "var(--mb-info-fg, var(--color-text-info))",
  "host-app-info-border": "var(--mb-info-border, var(--color-border-info))",
  "host-app-success-bg": "var(--mb-success-bg, var(--color-background-success))",
  "host-app-success-fg": "var(--mb-success-fg, var(--color-text-success))",
  "host-app-success-border": "var(--mb-success-border, var(--color-border-success))",
  "host-app-warning-bg": "var(--mb-warning-bg, var(--color-background-warning))",
  "host-app-warning-fg": "var(--mb-warning-fg, var(--color-text-warning))",
  "host-app-warning-border": "var(--mb-warning-border, var(--color-border-warning))",
  "host-app-danger-bg": "var(--mb-danger-bg, var(--color-background-danger))",
  "host-app-danger-fg": "var(--mb-danger-fg, var(--color-text-danger))",
  "host-app-danger-border": "var(--mb-danger-border, var(--color-border-danger))",
  "host-bg": "var(--color-background-primary)",
  "host-bg-secondary": "var(--color-background-secondary)",
  "host-bg-tertiary": "var(--color-background-tertiary)",
  "host-bg-inverse": "var(--color-background-inverse)",
  "host-fg": "var(--color-text-primary)",
  "host-fg-secondary": "var(--color-text-secondary)",
  "host-fg-tertiary": "var(--color-text-tertiary)",
  "host-fg-inverse": "var(--color-text-inverse)",
  "host-border": "var(--color-border-primary)",
  "host-border-secondary": "var(--color-border-secondary)",
  "host-border-tertiary": "var(--color-border-tertiary)",
  "host-bg-ghost": "var(--color-background-ghost)",
  "host-bg-disabled": "var(--color-background-disabled)",
  "host-fg-disabled": "var(--color-text-disabled)",
  "host-fg-ghost": "var(--color-text-ghost)",
  "host-border-inverse": "var(--color-border-inverse)",
  "host-border-ghost": "var(--color-border-ghost)",
  "host-border-disabled": "var(--color-border-disabled)",
  "host-ring": "var(--color-ring-primary)",
  "host-ring-secondary": "var(--color-ring-secondary)",
  "host-ring-inverse": "var(--color-ring-inverse)",
  "host-ring-info": "var(--color-ring-info)",
  "host-ring-danger": "var(--color-ring-danger)",
  "host-ring-success": "var(--color-ring-success)",
  "host-ring-warning": "var(--color-ring-warning)",
  "host-info-bg": "var(--color-background-info)",
  "host-info-fg": "var(--color-text-info)",
  "host-info-border": "var(--color-border-info)",
  "host-success-bg": "var(--color-background-success)",
  "host-success-fg": "var(--color-text-success)",
  "host-success-border": "var(--color-border-success)",
  "host-warning-bg": "var(--color-background-warning)",
  "host-warning-fg": "var(--color-text-warning)",
  "host-warning-border": "var(--color-border-warning)",
  "host-danger-bg": "var(--color-background-danger)",
  "host-danger-fg": "var(--color-text-danger)",
  "host-danger-border": "var(--color-border-danger)"
}

module.exports = {
  darkMode: "class",
  plugins: [containerQueries],
  theme: {
    extend: {
      colors: Object.fromEntries(Object.entries(colorVariables).map(([name, value]) => [
        name,
        ({ opacityValue } = {}) => opacityValue == null
          ? value
          : `color-mix(in oklab, ${value} calc(${opacityValue} * 100%), transparent)`,
      ])),
      borderRadius: {
      "host-xs": "var(--border-radius-xs)",
      "host-sm": "var(--border-radius-sm)",
      "host-md": "var(--border-radius-md)",
      "host-lg": "var(--border-radius-lg)",
      "host-xl": "var(--border-radius-xl)",
      "host-full": "var(--border-radius-full)"
      },
      fontSize: {
      "host-xs": [
            "var(--font-text-xs-size)",
            {
                  "lineHeight": "var(--font-text-xs-line-height)"
            }
      ],
      "host-sm": [
            "var(--font-text-sm-size)",
            {
                  "lineHeight": "var(--font-text-sm-line-height)"
            }
      ],
      "host-md": [
            "var(--font-text-md-size)",
            {
                  "lineHeight": "var(--font-text-md-line-height)"
            }
      ],
      "host-lg": [
            "var(--font-text-lg-size)",
            {
                  "lineHeight": "var(--font-text-lg-line-height)"
            }
      ],
      "host-heading-xs": [
            "var(--font-heading-xs-size)",
            {
                  "lineHeight": "var(--font-heading-xs-line-height)"
            }
      ],
      "host-heading-sm": [
            "var(--font-heading-sm-size)",
            {
                  "lineHeight": "var(--font-heading-sm-line-height)"
            }
      ],
      "host-heading-md": [
            "var(--font-heading-md-size)",
            {
                  "lineHeight": "var(--font-heading-md-line-height)"
            }
      ],
      "host-heading-lg": [
            "var(--font-heading-lg-size)",
            {
                  "lineHeight": "var(--font-heading-lg-line-height)"
            }
      ],
      "host-heading-xl": [
            "var(--font-heading-xl-size)",
            {
                  "lineHeight": "var(--font-heading-xl-line-height)"
            }
      ],
      "host-heading-2xl": [
            "var(--font-heading-2xl-size)",
            {
                  "lineHeight": "var(--font-heading-2xl-line-height)"
            }
      ],
      "host-heading-3xl": [
            "var(--font-heading-3xl-size)",
            {
                  "lineHeight": "var(--font-heading-3xl-line-height)"
            }
      ]
      },
      fontFamily: {
      "host-app-display": [
            "var(--mb-font-display, var(--font-sans))"
      ]
      },
    },
  },
}
