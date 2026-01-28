export default {
  cinemaApi: {
    input: "./api-documentation.json",
    output: {
      mode: "split",
      namingConvention: "kebab-case",
      target: "../../packages/api-sdk/src/generated/index.ts",
      schemas: {
        path: "../../packages/api-sdk/src/generated/schemas",
        type: "typescript",
      },
      httpClient: "axios",
      prettier: true,
    },
    hooks: {
      queries: true,
      mutators: {
        axios: {
          path: "../../packages/api-sdk/src/axios-instance.ts",
          name: "axiosInstance",
        },
      },
    },
  },
};
