import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    console.time("connect");
    await client.connect();
    console.timeEnd("connect");

    const res = await client.query("SELECT version()");
    console.log(res.rows);

    await client.end();
  } catch (e) {
    console.error(e);
  }
})();
