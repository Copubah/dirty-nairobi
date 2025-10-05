# Contributing to Dirty Nairobi

Thank you for your interest in contributing to Dirty Nairobi! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment** following the README instructions
4. **Create a new branch** for your feature or bug fix

## 🛠️ Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/dirty-nairobi.git
cd dirty-nairobi

# Set up backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up frontend
cd ../frontend
npm install

# Start development servers
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm start
```

## 📝 Code Style

### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for functions and classes
- Maximum line length: 88 characters (Black formatter)

### JavaScript/React (Frontend)
- Use ESLint and Prettier for code formatting
- Follow React best practices and hooks patterns
- Use meaningful component and variable names
- Write JSDoc comments for complex functions

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] Photo upload functionality
- [ ] Location search and selection
- [ ] Map display and clustering
- [ ] Search and filtering
- [ ] Mobile responsiveness

## 📋 Pull Request Process

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly
   - Run automated tests
   - Test manually in browser
   - Test on mobile devices

4. **Commit your changes** with clear messages
   ```bash
   git commit -m "Add: new location search feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes

## 🐛 Bug Reports

When reporting bugs, please include:
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, etc.)

## 💡 Feature Requests

For new features:
- **Describe the feature** and its benefits
- **Explain the use case** and user story
- **Consider implementation complexity**
- **Discuss with maintainers** before starting work

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Code Review** - All contributions are reviewed by maintainers

## 🙏 Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes
- GitHub contributors list

Thank you for helping make Nairobi cleaner! 🌍