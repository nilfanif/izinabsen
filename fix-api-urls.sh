#!/bin/bash

# Script to fix all API URLs in frontend

echo "🔧 Fixing API URLs in all frontend files..."

# Files to update
FILES=(
  "client/src/pages/AdminDashboard.jsx"
  "client/src/pages/EmployeeDashboard.jsx"
  "client/src/components/EmployeeList.jsx"
)

# Add import statement and replace fetch calls
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating $file..."
    
    # Check if import already exists
    if ! grep -q "import { API_URL } from" "$file"; then
      # Add import after the first import line
      sed -i '' "1a\\
import { API_URL } from '../config'\\
" "$file" 2>/dev/null || sed -i "1a import { API_URL } from '../config'" "$file"
    fi
    
    # Replace all fetch('/api/ with fetch(\`${API_URL}/api/
    sed -i '' "s|fetch('/api/|fetch(\`\${API_URL}/api/|g" "$file"
    sed -i '' "s|fetch(\"/api/|fetch(\`\${API_URL}/api/|g" "$file"
    
    # Fix closing quotes and backticks
    sed -i '' "s|')|')\`|g" "$file"
    sed -i '' "s|\")|\")\`|g" "$file"
    
    echo "✅ Updated $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ All files updated!"
echo ""
echo "Next steps:"
echo "1. npm run build"
echo "2. firebase deploy --only hosting"
