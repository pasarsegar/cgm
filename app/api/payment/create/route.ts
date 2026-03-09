import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Xendit } from 'xendit-node';
import midtransClient from 'midtrans-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, gateway, customer, items } = body;

    // Fetch settings from DB
    const { data: settingsData } = await supabase.from('settings').select('*');
    const paymentSettings = settingsData?.find(s => s.key === 'payment_settings')?.value;
    
    if (!paymentSettings) {
      return NextResponse.json({ error: "Payment settings not found" }, { status: 500 });
    }

    const settings = JSON.parse(paymentSettings);

    if (gateway === 'xendit') {
      if (!settings.xenditEnabled || !settings.xenditApiKey) {
        return NextResponse.json({ error: "Xendit is not configured" }, { status: 400 });
      }

      const x = new Xendit({ secretKey: settings.xenditApiKey });
      const { Invoice } = x;

      const resp = await Invoice.createInvoice({
        data: {
          externalId: orderId,
          amount: amount,
          payerEmail: customer.email,
          description: `Order ${orderId}`,
          invoiceDuration: 86400, // 24 hours
          successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?order_id=${orderId}`,
          failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout?error=payment_failed`
        }
      });

      return NextResponse.json({ url: resp.invoiceUrl });

    } else if (gateway === 'midtrans') {
      if (!settings.midtransEnabled || !settings.midtransServerKey) {
        return NextResponse.json({ error: "Midtrans is not configured" }, { status: 400 });
      }

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: settings.midtransServerKey,
        clientKey: settings.midtransClientKey
      });

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount
        },
        credit_card: {
          secure: true
        },
        customer_details: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone || '',
          billing_address: {
             first_name: customer.firstName,
             last_name: customer.lastName,
             address: customer.address,
             city: customer.city,
             postal_code: customer.postalCode
          },
          shipping_address: {
            first_name: customer.firstName,
            last_name: customer.lastName,
            address: customer.address,
            city: customer.city,
            postal_code: customer.postalCode
          }
        },
        item_details: items.map((item: any) => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            name: item.name.substring(0, 50) // Midtrans limit
        }))
      };

      const transaction = await snap.createTransaction(parameter);
      return NextResponse.json({ token: transaction.token, url: transaction.redirect_url });
    }

    return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
