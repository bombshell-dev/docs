# Bombshell Documentation

This directory contains the documentation for the different tools and features of Bombshell.

## Contributing

To contribute to the documentation:

1. Fork the repository
2. Make your changes
3. Submit a pull request

### Adding New Pages

To add a new page to the documentation:

1. Create a new Markdown file in the appropriate language directory (e.g., `en/`)
2. Add frontmatter with `title` and `description`
3. Update `config.json` to include the new page in the sidebar

Example frontmatter:

```md
---
title: My New Page
description: Description of my new page
---

# My New Page

Content goes here...
```

### Editing Existing Pages

To edit an existing page:

1. Find the page in the appropriate language directory
2. Make your changes
3. Submit a pull request

## Integration with bomb.sh

This documentation is designed to be integrated with the `bomb.sh` website. The content in this repository is deployed to the `docs.bomb.sh` subdomain and proxied through `bomb.sh/docs/`. Because of this, this site is developed and deployed using `/docs/` as a path prefix.

> [!IMPORTANT]
> When adding internal docs links, be sure to include the `/docs/` prefix!

## Local Development

To preview the documentation locally, clone this repository, install the dependencies with `pnpm`, and run the local development server. This site is intentionally developed independently of the main `bomb.sh` website.
