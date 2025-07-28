# Nostr Forms Tester

A comprehensive behavioral testing suite for the Nostr Forms application, built with TypeScript and Playwright.

## Features

- **TypeScript Support**: Full TypeScript implementation with strict type checking
- **Playwright Testing**: End-to-end testing with Playwright for reliable form testing
- **Comprehensive Test Coverage**: Tests for all form input types and validation scenarios
- **Automated Setup**: Automatic cloning and setup of the Nostr Forms repository

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd nostr-forms-tester
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running Tests

```bash
# Run all tests
npm test

# Run tests in development mode with watch
npm run dev

# Build TypeScript files
npm run build
```

### Test Scenarios

The test suite covers the following scenarios:

1. **Complete Form Submission**: Tests all input types (text, email, number, radio, checkbox, dropdown, date, time)
2. **Required Fields Only**: Tests submission with only required fields filled
3. **Form Validation**: Tests validation errors when required fields are missing

## Project Structure

```
nostr-forms-tester/
├── tests/
│   └── form.spec.ts          # Main test file with all test scenarios
├── types/
│   └── global.d.ts           # Global TypeScript declarations
├── run-tests.ts              # Main test runner script
├── playwright.config.ts      # Playwright configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies and scripts
└── README.md               # This file
```

## TypeScript Configuration

The project uses strict TypeScript configuration with:

- **Target**: ES2022
- **Module**: ESNext
- **Strict Mode**: Enabled
- **Source Maps**: Enabled
- **Declaration Files**: Generated

## Development

### Adding New Tests

1. Create new test files in the `tests/` directory
2. Use the Playwright test framework
3. Follow the existing patterns in `form.spec.ts`

### TypeScript Development

- Use `tsx` for running TypeScript files directly
- The project includes comprehensive type definitions
- Strict type checking is enabled

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure port 3000 is available for the test application
2. **Git Repository**: The test runner automatically clones the Nostr Forms repository
3. **Dependencies**: Run `npm install` if you encounter module resolution issues

### TypeScript Errors

- Ensure all dependencies are installed: `npm install`
- Check that `tsconfig.json` is properly configured
- Use `npm run build` to check for TypeScript compilation errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

ISC
