---
name: "terminal-simulator"
description: "Build interactive terminal simulator UI for websites, docs, onboarding, and tutorial pages. Use when the user wants CLI walkthroughs, terminal demos, fake terminal interfaces, or typewriter-style terminal animation."
when_to_use: "Use for frontend implementation of terminal-like website experiences, including guided install flows, React terminal components, static HTML terminal demos, platform-aware PowerShell/Bash/CMD examples, responsive terminal sections, and accessibility-friendly typing animation. Do not use for real shell automation or backend command execution."
---

# Terminal Simulator

## Description

Create polished terminal-style UI and interaction for websites, documentation, onboarding, tutorials, and developer marketing pages.

Prefer iterating on the existing implementation in `terminal-learning-kit` instead of inventing a new pattern.

## When To Use

Use this skill when the user asks for any of the following:

- An interactive terminal demo on a website
- A guided CLI tutorial with step-by-step commands and output
- A typewriter-style terminal animation
- A fake terminal UI for documentation, onboarding, or landing pages
- Improvements to an existing terminal simulator component
- Platform-aware terminal examples for PowerShell, CMD, Bash, or Zsh
- Responsive terminal sections for desktop and mobile web

Do not use this skill for real shell automation or backend command execution.

## Project References

This workspace already contains reusable implementation material:

- `terminal-learning-kit/core`: framework-agnostic typewriter and terminal state logic
- `terminal-learning-kit/react`: React UI components for the terminal experience
- `terminal-learning-kit/themes`: preset visual themes
- `terminal-learning-kit/examples/react-basic.html`: simple browser demo

Start by inspecting and reusing these files.

## Inputs To Collect

Before implementation, gather these details from the user when they are missing:

- Target stack: React, static HTML, or another frontend environment
- Usage mode: guided tutorial, free-type terminal, or both
- Target platforms: Windows, macOS, Linux, mobile web, desktop web
- Command style: PowerShell, CMD, Bash, Zsh, or mixed documentation output
- Visual style: macOS terminal, Windows terminal, Ubuntu terminal, or minimal neutral UI
- Motion requirements: full animation, reduced motion, or no animation

If the user does not specify, default to the simplest option that matches the existing codebase.

## What This Skill Produces

This skill is primarily for frontend implementation and UI behavior, not backend functionality.

Typical outputs:

- A reusable React terminal component
- A static HTML terminal demo for docs or landing pages
- Guided step-by-step terminal walkthrough UI
- Typewriter-style command and output animation
- Platform-aware command examples for Windows and Unix-like shells
- Responsive and accessible terminal sections

## Working Rules

1. Reuse the existing `terminal-learning-kit` structure before creating new files.
2. Keep support for both guided tutorials and free-type terminal interactions when relevant.
3. Preserve reduced-motion and accessibility behavior.
4. Keep terminal visuals configurable through props, theme tokens, or CSS variables.
5. Prefer small, targeted edits over broad rewrites.

## Implementation Checklist

1. Inspect the existing core and React components before changing anything.
2. Decide whether the request belongs in the core logic, React wrapper, themes, or examples.
3. Extend the current API shape instead of replacing it unless a bug forces a change.
4. Update the demo or example only if it helps verify the requested behavior.
5. Make sure the package still builds cleanly after the change.

## Trigger Scenarios

Trigger this skill in practical website work such as:

- Building a hero section that shows an installation flow in a terminal
- Turning a static code block into an interactive CLI tutorial
- Creating a product onboarding stepper with command and output playback
- Showing platform-specific setup instructions for Windows and macOS/Linux users
- Polishing an existing terminal UI to improve animation, responsiveness, or accessibility

## Cross-Platform Rules

Always adapt the result for the user's target platforms:

- Windows:
  - Prefer PowerShell examples by default
  - Use CMD only when the user explicitly wants legacy Windows shell examples
  - Avoid assuming Unix-only commands like `rm -rf` or `chmod`
  - Check path rendering, prompt symbols, and line endings
- macOS and Linux:
  - Prefer Bash or Zsh examples
  - Keep shell commands copy-paste friendly
  - Avoid Windows-only path syntax
- Web layout:
  - Ensure terminal width works on narrow screens
  - Prevent horizontal overflow where possible
  - Keep controls touch-friendly on mobile
- Accessibility:
  - Respect reduced motion preferences
  - Preserve semantic labels for input and output
  - Do not rely only on color to distinguish terminal states

When examples include commands, provide equivalent variants when platform differences are meaningful.

## Reusable Assets

Use the companion files in this skill package when helpful:

- `examples/input.md`: sample user request this skill should handle
- `examples/output.md`: expected response shape and delivery format
- `templates/react-guided-terminal.tsx`: reusable React example
- `templates/static-terminal-demo.html`: reusable static HTML example
- `resources/platform-adaptation.md`: adaptation checklist for shells and screen sizes

## Output Expectations

When implementing terminal simulator work:

- Keep command lines, output lines, and system lines visually distinct
- Support multiline output formatting
- Keep animation optional or skippable when appropriate
- Ensure the UI remains usable without autoplay
- Prefer deterministic example content over hidden magic behavior

## Delivery Format

When returning results for terminal simulator work:

1. State whether the work reused `terminal-learning-kit` or required new files.
2. Call out any platform-specific command or UI differences.
3. Mention how the user can preview or test the result.
4. Highlight accessibility or reduced-motion considerations when relevant.
