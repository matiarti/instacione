# Documentation Index

This directory contains all project documentation organized by category. Follow the structure below when adding new documentation.

## Directory Structure

```
docs/
├── README.md                    # This file - documentation index
├── setup/                       # Setup and installation documentation
│   ├── FIXED_STATUS.md
│   ├── MONGODB_CONNECTION_SUCCESS.md
│   └── SHADCN_INTEGRATION_SUCCESS.md
├── development/                 # Development guides and practices
│   ├── TESTING.md
│   └── OPERATOR_PAGES.md
├── project-status/              # Project planning and status updates
│   ├── parking-hub-mvp-plan.md
│   └── SPRINT_PLAN.md
├── architecture/                # Technical architecture and design
│   └── PROJECT_STRUCTURE.md
└── guides/                      # User guides and tutorials
```

## Documentation Guidelines

### File Naming Convention
- Use kebab-case for file names (e.g., `setup-mongodb.md`)
- Be descriptive but concise
- Include version numbers when applicable (e.g., `api-v2-guide.md`)

### Categories

#### `/setup/`
- Installation guides
- Configuration documentation
- Environment setup
- Success/status reports for setup tasks

#### `/development/`
- Coding standards and practices
- Testing documentation
- Development workflow guides
- Code review guidelines

#### `/project-status/`
- Project plans and roadmaps
- Sprint planning documents
- Status updates and milestones
- Feature specifications

#### `/architecture/`
- System design documents
- Database schemas
- API documentation
- Technical decisions and rationale

#### `/guides/`
- User guides and tutorials
- How-to documentation
- Best practices for end users
- FAQ and troubleshooting

### Content Standards

1. **Start with a clear title and purpose**
2. **Include a table of contents for long documents**
3. **Use consistent formatting and structure**
4. **Add dates and version information when relevant**
5. **Cross-reference related documentation**
6. **Keep content up-to-date and accurate**

### Adding New Documentation

1. Determine the appropriate category based on content type
2. Follow the naming convention
3. Update this README.md if creating new categories
4. Add cross-references to related documents
5. Include the document in version control

## Quick Links

- [Project Overview](../README.md)
- [Setup Status](./setup/)
- [Development Guidelines](./development/)
- [Operator Pages Guide](./development/OPERATOR_PAGES.md)
- [Project Planning](./project-status/)
- [Architecture Overview](./architecture/)