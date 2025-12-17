// This is our Netlify Function for validating a license key

// 1. This is the new, correct import syntax
// We import the *specific functions* we need.
import {
    lemonSqueezySetup,
    validateLicense
} from "@lemonsqueezy/lemonsqueezy.js";

export default async (req, context) => {
    // 2. Get the API key from Netlify's secure environment variables
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
            status: 500,
        });
    }

    // 3. Run the one-time setup for the library
    // This is the step we were missing.
    lemonSqueezySetup({
        apiKey: apiKey,
        onError: (error) => {
            // Log any setup errors
            console.error("Lemon Squeezy Setup Error:", error);
        }
    });

    try {
        // 4. Get the license key that the user sent from the app
        const { key } = await req.json();

        if (!key) {
            return new Response(JSON.stringify({ error: 'No license key provided.' }), {
                status: 400, // 400 = Bad Request
            });
        }

        console.log(`Validating license key: ${key}`);

        // 5. This is the magic: Ask Lemon Squeezy to validate the key
        // We call the 'validateLicense' function we imported.
        const response = await validateLicense(key);

        console.log("Lemon Squeezy Response:", response);

        // 6. Check the response and send a reply to our app
        if (response.valid === true) {
            // SUCCESS! The key is real and active.
            return new Response(JSON.stringify({ valid: true }), {
                status: 200,
            });
        } else {
            // FAILURE. The key is invalid or expired.
            let friendlyError = response.data.error; // Default error
        
            // --- This is where we make it friendly ---
            if (response.data.error === 'license_key not found.') {
                friendlyError = "That license key wasn't found. Please check for typos and try again.";
            } else if (response.data.error === 'license_key has expired.') {
                friendlyError = 'This license key has expired. Please purchase a new pass.';
            }
            // --- End of friendly error logic ---
        
            return new Response(JSON.stringify({ error: friendlyError }), {
                status: 404, // 404 = Not Found
            });
        }

    } catch (error) {
        console.error("Validation Error:", error);
    
        // This will catch errors if the key format is just wrong
        if (error.cause && error.cause.errors) {
            return new Response(JSON.stringify({ error: "Invalid license key format. Please check for typos and try again." }), {
                status: 422,
            });
        }
    
        // This is a generic server error that isn't really helpful to the user
        return new Response(JSON.stringify({ error: "An unknown server error occurred. Please try again." }), {
            status: 500,
        });
    }
};