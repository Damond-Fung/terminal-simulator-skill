import { TerminalSimulator, type TerminalStep } from 'terminal-learning-kit/react';
import 'terminal-learning-kit/themes/macos-dark.css';

type ShellPlatform = 'powershell' | 'cmd' | 'bash' | 'zsh';

const stepsByPlatform: Record<ShellPlatform, TerminalStep[]> = {
  powershell: [
    {
      id: 'create-project',
      command: 'npx create-next-app@latest demo-site',
      output: 'Success! Created demo-site',
      description: 'Create the project with PowerShell-friendly commands',
    },
    {
      id: 'run-dev',
      command: 'cd .\\demo-site; npm run dev',
      output: 'Local: http://localhost:3000',
      description: 'Start the local development server',
    },
  ],
  cmd: [
    {
      id: 'create-project',
      command: 'npx create-next-app@latest demo-site',
      output: 'Success! Created demo-site',
      description: 'Create the project with CMD-friendly commands',
    },
    {
      id: 'run-dev',
      command: 'cd demo-site && npm run dev',
      output: 'Local: http://localhost:3000',
      description: 'Start the local development server',
    },
  ],
  bash: [
    {
      id: 'create-project',
      command: 'npx create-next-app@latest demo-site',
      output: 'Success! Created demo-site',
      description: 'Create the project with Bash-friendly commands',
    },
    {
      id: 'run-dev',
      command: 'cd demo-site && npm run dev',
      output: 'Local: http://localhost:3000',
      description: 'Start the local development server',
    },
  ],
  zsh: [
    {
      id: 'create-project',
      command: 'npx create-next-app@latest demo-site',
      output: 'Success! Created demo-site',
      description: 'Create the project with Zsh-friendly commands',
    },
    {
      id: 'run-dev',
      command: 'cd demo-site && npm run dev',
      output: 'Local: http://localhost:3000',
      description: 'Start the local development server',
    },
  ],
};

const variantByPlatform: Record<ShellPlatform, 'windows' | 'macos' | 'ubuntu'> = {
  powershell: 'windows',
  cmd: 'windows',
  bash: 'ubuntu',
  zsh: 'macos',
};

export function GuidedTerminalExample({
  platform = 'bash',
}: {
  platform?: ShellPlatform;
}) {
  const steps = stepsByPlatform[platform];

  return (
    <TerminalSimulator
      mode="guided"
      steps={steps}
      title={`Quick Start (${platform})`}
      variant={variantByPlatform[platform]}
      theme="dark"
      autoPlay={false}
    />
  );
}
