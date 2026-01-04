export default {
  cinemaApi: {
    input: './api-documentation.json',
    output: {
      mode: 'split',
      target: '../../packages/api-sdk/src/generated/index.ts',
      schemas: '../../packages/api-sdk/src/generated/schemas',
      client: 'axios',
      prettier: true,
    },
    hooks: {
      queries: true,
      mutators: {
        axios: {
          path: '../../packages/api-sdk/src/axios-instance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
}
