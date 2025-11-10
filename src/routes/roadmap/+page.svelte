<script>
	import logo from '$lib/assets/icon-512.png'; // <-- ADD THIS
</script>

<svelte:head>
    <title>Our Roadmap - Data Merge Tool</title>
</svelte:head>

<main>
    <img src={logo} alt="Data Merge Logo" class="logo" />
    <h1>Our Public Roadmap</h1>
    <p>
        We build what our users need! <br><br>
        <a href="https://forms.gle/uGXSuYcz1kZxgcvq9" target="_blank" class="back-link">Add your ideas</a>
    </p>

    <div class="roadmap-grid">
        <section class="roadmap-column">
            <h2>✅ Shipped</h2>
            <ul>
                <li>Core CSV Compare & Merge</li>
                <li>Freemium Paywall (500 rows)</li>
                <li>PWA "Add to Home Screen"</li>
                <li>Excel (.xlsx & .xls) File Support</li>
                <li>File Preview Table</li>
            </ul>
        </section>

        <section class="roadmap-column">
            <h2>🛠️ Building Next</h2>
            <ul>
                <li>Automated Pro License Delivery</li>
            </ul>
        </section>

        <section class="roadmap-column">
            <h2>💡 Under Consideration</h2>
            <ul>
                <li>Data "Update" Function</li>
                <li>Saving Column Map Templates</li>
                <li>Fuzzy Matching</li>
                <li>Export Column Selector</li>
                <li>Drag-and-Drop File Uploads</li>
            </ul>
        </section>
    </div>

    <a href="/app" class="back-link">← Back to the app</a>
</main>

<style>
    main {
        max-width: 960px;
        margin: 0 auto;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #333;
    }
    h1 {
        color: #2c3e50;
        text-align: center;
        font-size: 2.2rem;
    }
    p {
        text-align: center;
    }

    /* Add this for the logo */
    .logo {
        width: 60px;
        height: 60px;
        display: block;
        margin: 0 auto 1rem auto;
    }
    .roadmap-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
        text-align: center;
    }
    .roadmap-column {
        background: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 1.5rem;
    }
    h2 {
        margin-top: 0;
        border-bottom: 2px solid #3498db;
        padding-bottom: 0.5rem;
        font-size: 1.25rem;
    }
    ul {
        padding-left: 1.25rem;
    }
    li {
        margin-bottom: 0.5rem;
        text-align: left;
    }
    a {
        color: #3498db;
        font-weight: 500;

        /* Add these lines to make it a button */
        display: inline-block;
        background-color: #ecf0f1;
        color: #34495e;
        border: 1px solid #bdc3c7;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        transition: background-color 0.2s ease, transform 0.1s ease;
    }

    a:hover {
        background-color: #e2e6e8;
        transform: translateY(-1px);
    }
    .back-link {
    /* This combination will center the button */
        display: block;
        width: fit-content;
        margin: 2rem auto 0 auto;

        /* These are your existing button styles */
        font-weight: 600;
        font-size: 1.1rem;
        background-color: #3498db;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        text-decoration: none;
        border: none;
        transition: background-color 0.2s ease;
    }

    .back-link:hover {
        background-color: #2980b9;
    }
</style>