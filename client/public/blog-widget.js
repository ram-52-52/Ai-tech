(function() {
    const CONTAINER_ID = 'ai-tech-blog-feed';
    const currentScript = document.currentScript;
    const API_BASE_URL = currentScript ? new URL(currentScript.src).origin : 'https://ai-tech-5l4y.onrender.com';
    const CSS_URL = `${API_BASE_URL}/widget.css`;

    function initWidget() {
        const MAX_RETRIES = 10;
        const RETRY_INTERVAL = 500;
        let attempts = 0;

        const tryInit = () => {
            const container = document.getElementById(CONTAINER_ID);

            if (!container) {
                attempts++;
                if (attempts >= MAX_RETRIES) {
                    console.error(`[AI-Tech Widget] Container #${CONTAINER_ID} not found after ${MAX_RETRIES} attempts (${MAX_RETRIES * RETRY_INTERVAL / 1000}s). Giving up.`);
                    return;
                }
                setTimeout(tryInit, RETRY_INTERVAL);
                return;
            }

            // Container found — proceed with initialization
            setupWidget(container);
        };

        tryInit();
    }

    async function setupWidget(container) {

        const clientId = container.getAttribute('data-client-id');
        if (!clientId) {
            console.error(`[AI-Tech Widget] data-client-id is missing.`);
            return;
        }

        // Inject CSS if not already present
        if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = CSS_URL;
            document.head.appendChild(link);
        }

        // Handle routing within the widget
        const render = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');

            if (slug) {
                await renderDetailView(container, clientId, slug);
            } else {
                await renderListView(container, clientId);
            }
        };

        // Event delegation for seamless navigation
        container.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.hasAttribute('href')) {
                const href = link.getAttribute('href');
                if (href.startsWith('?slug=') || href === '?' || href === window.location.pathname) {
                    e.preventDefault();
                    window.history.pushState({}, '', href === '?' ? window.location.pathname : href);
                    window.dispatchEvent(new Event('popstate'));
                }
            }
        });

        window.addEventListener('popstate', render);
        render(); // Initial load check for deep linking
    }

    async function renderListView(container, clientId) {
        document.title = "Blog"; // Reset title on list view
        container.innerHTML = '<div class="at-loader">Loading blogs...</div>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/feed/${clientId}`);
            if (!response.ok) throw new Error('Failed to fetch feed');
            const blogs = await response.json();

            if (blogs.length === 0) {
                container.innerHTML = '<div class="at-empty">No blogs available yet.</div>';
                return;
            }

            let html = '<div class="at-blog-list">';
            blogs.forEach(blog => {
                const date = new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                html += `
                    <div class="at-blog-card">
                        <div class="at-card-image">
                            <img src="${blog.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image'}" alt="${blog.title}">
                        </div>
                        <div class="at-card-content">
                            <div class="at-card-meta">${date} • ${blog.topic || 'General'}</div>
                            <h3 class="at-card-title">${blog.title}</h3>
                            <p class="at-card-description">${blog.metaDescription}</p>
                            <a href="?slug=${blog.slug}" class="at-read-more">READ MORE</a>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="at-error">Error loading blogs: ${error.message}</div>`;
        }
    }

    async function renderDetailView(container, clientId, slug) {
        container.innerHTML = '<div class="at-loader">Loading blog details...</div>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/feed/${clientId}?slug=${slug}`);
            if (!response.ok) throw new Error('Blog not found');
            const blog = await response.json();

            document.title = blog.title; // Update page title to blog title
            const date = new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            container.innerHTML = `
                <div class="at-blog-detail">
                    <a href="?" class="at-back-link">← Back to Blogs</a>
                    <div class="at-detail-meta">${date} • <span class="at-topic">${blog.topic || 'General'}</span></div>
                    <h1 class="at-detail-title">${blog.title}</h1>
                    <div class="at-detail-image">
                        <img src="${blog.imageUrl || 'https://via.placeholder.com/800x450?text=No+Image'}" alt="${blog.title}">
                    </div>
                    <div class="at-detail-content">
                        ${blog.content}
                    </div>
                    ${blog.tags && blog.tags.length > 0 ? `
                        <div class="at-detail-tags">
                            ${blog.tags.map(tag => `<span class="at-tag">#${tag}</span>`).join(' ')}
                        </div>
                    ` : ''}
                </div>
            `;
            // Scroll to top of widget container
            container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            container.innerHTML = `<div class="at-error">Error loading blog: ${error.message} <br> <a href="?">Back to list</a></div>`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();
