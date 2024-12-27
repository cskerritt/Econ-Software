#!/bin/bash

# Run tests with coverage
npx vitest run --coverage

# Generate HTML report
npx nyc report --reporter=html

# Open coverage report in browser
open coverage/index.html
