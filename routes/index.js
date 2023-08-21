// Stored in /routes/index.js

import config from "../config.js";

export default (hostComponent) => {
  // Clear any existing content in the hostComponent
  hostComponent.innerHTML = '';

  // Create some new HTML content
  const indexHTML = `
    <h1>Welcome to the ${config.SITE_NAME}!</h1>
    <p>This is some content for the homepage.</p>
  `;

  // Append the new content to the hostComponent
  hostComponent.innerHTML = indexHTML;
};
