# Platform Adaptation Checklist

## Shell Commands

- Windows default shell: PowerShell
- Windows legacy shell: CMD
- macOS default shell: Zsh (or Bash depending on user setup)
- Linux default shell: Bash (often), Zsh (sometimes)

When your examples include shell commands, provide matching variants:

| Task | PowerShell | Bash / Zsh |
| --- | --- | --- |
| List files | `Get-ChildItem` | `ls` |
| Create folder | `New-Item -ItemType Directory demo` | `mkdir demo` |
| Remove folder | `Remove-Item -Recurse -Force demo` | `rm -rf demo` |
| Copy file | `Copy-Item a.txt b.txt` | `cp a.txt b.txt` |

Avoid Unix-only commands in Windows-only contexts.

## Visual Variants

- Windows: choose the `windows` variant when showing window chrome
- macOS: choose the `macos` variant
- Ubuntu/Linux: choose the `ubuntu` or `minimal` variant

## Layout

- Limit terminal max width to keep readability on wide screens
- Allow line wrapping for long commands
- Ensure buttons and inputs remain usable on touch screens

## Accessibility

- Keep `prefers-reduced-motion` support
- Keep visible focus states for keyboard navigation
- Do not rely only on color to distinguish line types
