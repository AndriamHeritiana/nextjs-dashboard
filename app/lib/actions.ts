'use server';
import { z } from 'zod';
import postgres from "postgres";
const DB_URL = `${process.env.POSTGRES_URL}`;
const client = {sql: postgres(DB_URL, {max: 10,idle_timeout: 30000})};
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})
const CreateInvoice = FormSchema.omit({id: true, date: true})
export async function createInvoice(formData : FormData){
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId : formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    const amountInCents = amount*100;
    const date = new Date().toISOString().split('T')[0];
    try {
        await client.sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
    }catch (e){
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    try {
        await client.sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    }catch (e){
        return{
            message: 'Database Error : Failed to Update Invoince.',
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}
export async function deleteInvoice(id: string) {
    try {
        await client.sql`DELETE FROM invoices WHERE id = ${id}`;
    }catch (e){
        return{
            message: 'Database Error: Failed to Delete Invoice',
        };
    }
    revalidatePath('/dashboard/invoices');
}