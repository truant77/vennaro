<script>
    import { goto } from '$app/navigation';
    import PayfastButton from '$lib/components/PayfastButton.svelte';
    import logo from '$lib/assets/icon-512.png';

    function goToApp() {
        goto('/app'); // Navigates user to the app page
    }
</script>

<main>
    <header>
        <img src={logo} alt="Data Merge Logo" class="logo" />
        <h1>The Fastest Way to Compare & Merge CSVs</h1>
        <p class="subhead">
            Stop fighting with VLOOKUP. Get your data matched in seconds,
            100% in your browser.
        </p>
        <div class="cta-buttons">
            <button class="cta-primary" on:click={goToApp}>
                Go to App (Free)
            </button>
            <PayfastButton class="cta-secondary">
                Upgrade to Pro (R79.99/mo)
            </PayfastButton>
        </div>
    </header>

    <section class="features">
        <h2>Your Data. Your Browser. Your Time Back.</h2>
        <div class="feature-grid">
            <div class="feature-item">
                <h3>🚀 Blazing Fast</h3>
                <p>
                    No installs. No server uploads. Our tool processes your
                    files directly in your browser.
                </p>
            </div>
            <div class="feature-item">
                <h3>🔒 100% Private</h3>
                <p>
                    Your sensitive data never leaves your computer. We never
                    see it, store it, or share it.
                </p>
            </div>
            <div class="feature-item">
                <h3>📈 Unlimited Power</h3>
                <p>
                    Our free tier gives you 500 rows to play with. Upgrade to Pro for
                    unlimited rows and full XLSX support.
                </p>
            </div>
        </div>
    </section>
</main>

<style>
    :global(body) {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #ffffff;
        color: #2c3e50;
    }

    main {
        max-width: 960px;
        margin: 0 auto;
        padding: 2rem;
    }

    header {
        text-align: center;
        padding: 4rem 1rem;
        background-color: #f4f7f6;
        border-radius: 8px;
    }

    h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    .subhead {
        font-size: 1.25rem;
        color: #555;
        max-width: 600px;
        margin: 0 auto 2rem auto;
    }

    .cta-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .cta-primary {
        font-size: 1rem;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        background-color: #3498db;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    .cta-primary:hover {
        background-color: #2980b9;
    }

    :global(.cta-secondary) {
        font-size: 1rem;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        background-color: #3498db; /* Blue background */
        color: white; /* White text */
        border: none; /* No border */
        text-decoration: none;
        transition: background-color 0.2s ease;
    }
    :global(.cta-secondary:hover) {
        background-color: #2980b9; /* Darker blue on hover */
    }

    .features {
        padding: 4rem 0;
        text-align: center;
    }

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
        text-align: left;
    }

    .feature-item {
        background: #fcfcfc;
        border: 1px solid #eee;
        padding: 1.5rem;
        border-radius: 8px;
    }

    .feature-item h3 {
        margin-top: 0;
    }
    
    /* Add this for the logo */
    .logo {
        width: 80px;
        height: 80px;
        margin-bottom: 1rem;
    }
</style>