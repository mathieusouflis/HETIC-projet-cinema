export default {
  '*': () => [
    'pnpm lint',
    'pnpm check-types',
    'pnpm test',
    'pnpm build'
  ]
};
