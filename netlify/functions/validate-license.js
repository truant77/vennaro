// netlify/functions/validate-license.js
import { lemonSqueezySetup, validateLicense } from "@lemonsqueezy/lemonsqueezy.js";

export default async (req, context) => {
    // 1. Setup with your Live API Key from Netlify Environment Variables
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
        console.error("Missing LEMONSQUEEZY_API_KEY in environment variables.");
        return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
            status: 500,
        });
    }

    lemonSqueezySetup({ apiKey });

    // 2. Only allow POST requests (prevents crashes from browser visits)
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { 
            status: 405 
        });
    }

    try {
        // 3. Parse the body and sanitize the key
        const body = await req.json();
        
        // Force the key to be a string and trim whitespace to avoid 422 errors
        const licenseKey = String(body.key || "").trim();

        if (!licenseKey) {
            return new Response(JSON.stringify({ error: 'No license key provided.' }), {
                status: 400,
            });
        }

        console.log(`Attempting to validate key: ${licenseKey}`);

        // 4. Validate the key
        // We pass only the key; Lemon Squeezy identifies the store/product via your API Key
        const response = await validateLicense(licenseKey);

        console.log("Lemon Squeezy API Response:", response);

        // 5. Check if the response indicates a successful validation
        if (response.statusCode === 200 && response.data?.valid === true) {
            return new Response(JSON.stringify({ valid: true }), {
                status: 200,
            });
        } else {
            // Handle specific error messages from Lemon Squeezy
            const apiError = response.data?.error || "This license key is invalid.";
            let friendlyError = apiError;

            if (apiError.includes("not found")) {
                friendlyError = "License key not found. Please check for typos.";
            } else if (apiError.includes("expired")) {
                friendlyError = "This license key has expired.";
            }

            return new Response(JSON.stringify({ error: friendlyError }), {
                status: 400,
            });
        }

    } catch (error) {
        console.error("Internal Function Error:", error);
        
        // Catching the "Unexpected end of JSON" or connection issues
        return new Response(JSON.stringify({ error: "An error occurred while validating the key. Please try again." }), {
            status: 500,
        });
    }
};