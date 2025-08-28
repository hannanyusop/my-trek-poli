# My Trek Poli

Welcome to My Trek Poli - a Laravel application built with React and Inertia.js.

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.3.23)
- **Frontend**: React 19 with Inertia.js v2
- **Styling**: Tailwind CSS v4
- **Testing**: Pest v4
- **Code Style**: Laravel Pint

## Quick Start

### Development
```bash
# Start the development server
php artisan serve --host=0.0.0.0 --port=8080
```

### Testing
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ExampleTest.php

# Run tests with filter
php artisan test --filter=testName
```

### Code Formatting
```bash
# Format code with Pint
vendor/bin/pint --dirty
```

## Project Structure

- `app/` - Laravel application code
- `resources/js/Pages/` - Inertia.js React components
- `tests/` - Pest test files
- `docs/` - Project documentation

## Getting Started

1. Install dependencies: `composer install && npm install`
2. Copy environment file: `cp .env.example .env`
3. Generate app key: `php artisan key:generate`
4. Run migrations: `php artisan migrate`
5. Start development: `npm run dev`

## Contributing

Follow the Laravel Boost guidelines defined in `CLAUDE.md` for consistent code style and best practices.
