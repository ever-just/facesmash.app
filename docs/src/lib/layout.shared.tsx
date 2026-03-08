import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const gitConfig = {
  user: 'ever-just',
  repo: 'facesmash.app',
  branch: 'main',
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'FaceSmash Docs',
      url: '/',
    },
    links: [
      { text: 'Documentation', url: '/docs', active: 'nested-url' },
      { text: 'API Reference', url: '/docs/api-reference', active: 'nested-url' },
      { text: 'FaceSmash App', url: 'https://facesmash.app', external: true },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
