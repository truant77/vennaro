<script>
    import { goto } from '$app/navigation';
    import logo from '$lib/assets/vennaro_logo.png';

    function goToApp() {
        goto('/app'); // Navigates user to the app page
    }
</script>

<main>
    <header>
        <img src={logo} alt="Data Merge Logo" class="logo" />
        <h1>Instant Data Matching. <br>Zero Spreadsheet Drama.</h1>
        <p class="subhead">
            Compare and merge Excel or CSV files without formulas, downloads, or frustration.
            Match data in a flash, right in your browser.
        </p>
        <div class="cta-buttons">
            <button class="button-primary" onclick={goToApp}>
                Use App for Free<br>(500 rows)
            </button>
            <a href="https://holmbrewed.lemonsqueezy.com/buy/9672a88b-f6a4-4218-a1a2-099aa89d6998?embed=1&logo=0&discount=0" class="button-primary lemonsqueezy-button">
                Upgrade to Pro<br>($19/year)
            </a>
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
                    unlimited rows and Premium features (one-time payment, no auto-renewal).
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
        padding: 1rem;
    }

    header {
        text-align: center;
        padding: 0 0.5rem 1.5rem 0.5rem;
        background-color: #f4f7f6;
        border-radius: 8px;
    }

    h1 {
        font-size: 3rem;
        font-weight: 700;
        margin:0;
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

        text-align: center;
    }

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
        text-align: left;
    }

    .feature-item {
        background: #fcfcfc;
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 8px;
    }

    .feature-item h3 {
        margin-top: 0;
    }
    
    /* Add this for the logo */
    .logo {
        
        height: 125px;
        margin-bottom: 0.5rem;
    }

    .button-primary, :global(.lemonsqueezy-button) {
        /* Layout & Box Model */
        display: inline-block; 
        box-sizing: border-box;
        padding: 0.6rem 1.1rem; /* <-- REDUCED PADDING */
        border: none;
        border-radius: 6px;

        /* Typography */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 0.9rem; /* <-- REDUCED FONT */
        font-weight: 600;
        line-height: 1.2; /* <-- REDUCED LINE HEIGHT */
        color: white;
        text-decoration: none; 
        text-align: center; 
        vertical-align: middle;

        /* Appearance */
        background-color: #3498db;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .button-primary:hover {
        background-color: #2980b9;
        text-decoration: none; /* <-- Also add here */
    }
</style>