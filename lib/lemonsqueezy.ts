const LS_API = 'https://api.lemonsqueezy.com/v1'

function lsHeaders() {
  return {
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY!}`,
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  }
}

export async function createCheckout(userId: string, email: string): Promise<string> {
  const res = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: lsHeaders(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
          },
        },
        relationships: {
          store: {
            data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID! },
          },
          variant: {
            data: { type: 'variants', id: process.env.LEMONSQUEEZY_VARIANT_ID! },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.errors?.[0]?.detail ?? 'Failed to create checkout')
  }

  const json = await res.json()
  return json.data.attributes.url as string
}
