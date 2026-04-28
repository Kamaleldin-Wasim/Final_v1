# Contributing to No Smoke Journey

Thank you for your interest in contributing to No Smoke Journey! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/NoSmokeJourney.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

### Prerequisites
- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 or VS Code

### Building the Project
```bash
dotnet restore
dotnet build
```

### Running Tests
```bash
dotnet test
```

## Code Style

- Follow the existing code style
- Use meaningful variable and method names
- Add XML documentation comments for public APIs
- Keep methods small and focused
- Use async/await for asynchronous operations

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add user authentication

- Implement JWT token generation
- Add login and register endpoints
- Add password hashing with BCrypt

Fixes #123
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass
3. Update documentation as needed
4. Request review from maintainers
5. Address review comments
6. Once approved, your PR will be merged

## Reporting Bugs

When reporting bugs, please include:
- A clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, .NET version, etc.)

## Feature Requests

We welcome feature requests! Please:
- Describe the feature clearly
- Explain why it would be useful
- Provide examples of how it would work

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Questions?

If you have questions, feel free to:
- Open an issue
- Contact the maintainers
- Join our community discussions

Thank you for contributing! 🎉
