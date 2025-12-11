import dotenv from "dotenv";

dotenv.config({ path: "../../.env" , debug: true});

export const env = {
  API_PORT: process.env.API_PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/cinema',
};
