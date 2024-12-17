import postgres from "postgres";
const DB_URL = `${process.env.POSTGRES_URL}`;
const client = {
    sql: postgres(DB_URL, {max: 10, idle_timeout: 30000,}),
};
async function listInvoices() {
	const data = await client.sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;
    return data.map(row =>({
        amount : row.amount,
        name : row.name,
    }))
	return data.rows;
}

export async function GET() {
  try {
  	return Response.json(await listInvoices());
  } catch (error) {
      console.log(error);
  	return Response.json({ error }, { status: 500 });
  }
}
