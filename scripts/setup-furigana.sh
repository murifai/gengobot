#!/bin/bash

# Setup script for Kuroshiro/Kuromoji dictionary files
# This script copies the dictionary files from node_modules to public folder

echo "Setting up Kuroshiro dictionary files..."

# Create dict directory if it doesn't exist
mkdir -p public/dict

# Check if kuromoji is installed
if [ ! -d "node_modules/kuromoji" ]; then
  echo "❌ Error: kuromoji not found in node_modules"
  echo "Please run 'npm install' first"
  exit 1
fi

# Copy dictionary files
echo "Copying dictionary files from node_modules/kuromoji/dict/ to public/dict/..."
cp -r node_modules/kuromoji/dict/*.dat.gz public/dict/

# Check if files were copied successfully
if [ $? -eq 0 ]; then
  echo "✅ Dictionary files copied successfully!"
  echo "📊 Dictionary size: $(du -sh public/dict | cut -f1)"
  echo ""
  echo "Dictionary files in public/dict/:"
  ls -lh public/dict/*.dat.gz
else
  echo "❌ Error: Failed to copy dictionary files"
  exit 1
fi
