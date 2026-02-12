export default {
  '*': () => [
    'pnpm lint',
    'pnpm check-types --affected',
    'pnpm test',
    'pnpm build'
  ]
};
