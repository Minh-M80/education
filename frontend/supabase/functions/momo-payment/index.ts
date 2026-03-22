// MoMo Payment Edge Function v2 - Default action is "create"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  extraData?: string;
}

/**
 * Generate HMAC SHA256 signature for MoMo
 */
function generateSignature(rawSignature: string, secretKey: string): string {
  const hmac = createHmac("sha256", secretKey);
  hmac.update(rawSignature);
  return hmac.digest("hex");
}

/**
 * Create MoMo payment request
 */
async function createPayment(request: MoMoPaymentRequest) {
  const partnerCode = Deno.env.get("MOMO_PARTNER_CODE") || "MOMOBKUN20180529";
  const accessKey = Deno.env.get("MOMO_ACCESS_KEY") || "klm05TvNBzhg7h7j";
  const secretKey = Deno.env.get("MOMO_SECRET_KEY") || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
  
  // Use sandbox endpoint for testing
  const endpoint = Deno.env.get("MOMO_ENDPOINT") || "https://test-payment.momo.vn/v2/gateway/api/create";
  
  const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const requestType = "payWithMethod";
  const extraData = request.extraData || "";
  const autoCapture = true;
  const lang = "vi";

  // Create raw signature string according to MoMo spec
  const rawSignature = `accessKey=${accessKey}&amount=${request.amount}&extraData=${extraData}&ipnUrl=${request.ipnUrl}&orderId=${request.orderId}&orderInfo=${request.orderInfo}&partnerCode=${partnerCode}&redirectUrl=${request.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
  const signature = generateSignature(rawSignature, secretKey);

  const requestBody = {
    partnerCode,
    partnerName: "LMS Course Platform",
    storeId: "LMSStore",
    requestId,
    amount: request.amount,
    orderId: request.orderId,
    orderInfo: request.orderInfo,
    redirectUrl: request.redirectUrl,
    ipnUrl: request.ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    signature,
  };

  console.log("MoMo Request:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  console.log("MoMo Response:", JSON.stringify(data, null, 2));

  return data;
}

/**
 * Verify MoMo callback signature
 */
function verifyCallback(callbackData: Record<string, unknown>): boolean {
  const secretKey = Deno.env.get("MOMO_SECRET_KEY") || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
  const accessKey = Deno.env.get("MOMO_ACCESS_KEY") || "klm05TvNBzhg7h7j";
  
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = callbackData;

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const expectedSignature = generateSignature(rawSignature, secretKey);
  
  return signature === expectedSignature;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const action = body.action || "create"; // Default to create

      if (action === "create") {
        // Create payment
        const result = await createPayment(body);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "callback" || action === "ipn") {
        // Handle IPN callback from MoMo
        const isValid = verifyCallback(body);
        
        if (!isValid) {
          console.error("Invalid MoMo signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Process the payment result
        console.log("Valid MoMo callback:", body);
        
        // Here you would update your database with payment status
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("MoMo Payment Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
