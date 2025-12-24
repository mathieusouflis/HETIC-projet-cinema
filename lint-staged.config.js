export default {
  '*': () => [
    'pnpm format',
    'pnpm lint',
    'pnpm check-types',
    'pnpm test',
    'pnpm build'
  ]
};
