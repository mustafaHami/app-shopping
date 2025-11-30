import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // chemin vers ton schema.prisma
  schema: 'prisma/schema.prisma',

  // config utilisée par prisma db pull / db push / migrate
  datasource: {
    url: process.env.DATABASE_URL!,
    // éventuellement :
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },

  // optionnel, mais pratique :
  // migrations: {
  //   path: 'prisma/migrations',
  // },
})