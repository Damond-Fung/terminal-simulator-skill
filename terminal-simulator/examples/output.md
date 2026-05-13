# Example Output

## Summary

- Reused `terminal-learning-kit` instead of creating a new terminal pattern
- Implemented a guided terminal walkthrough for the docs page
- Added platform-aware command examples for PowerShell and Bash
- Preserved responsive layout and reduced-motion behavior

## What Was Built

- A reusable React terminal block for the docs site
- Separate command and output rendering
- A guided tutorial flow with step labels and skip support
- Styling that remains usable on desktop and mobile screens

## Platform Notes

- Windows examples default to PowerShell wording and command syntax
- macOS and Linux examples use Bash-compatible commands
- Long lines wrap instead of overflowing on narrow screens

## Verification

- Preview locally in the browser
- Test one Windows-flavored example and one Unix-flavored example
- Confirm command copy matches the selected target shell
