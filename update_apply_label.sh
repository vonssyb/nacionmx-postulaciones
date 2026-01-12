#!/bin/bash

# Update the Roblox input label and add helper text
sed -i '' 's/Nombre de Usuario de Roblox \*/User ID o Nombre de Usuario de Roblox */g' src/pages/ApplyPage.jsx
sed -i '' 's/placeholder="Ej: JohnDoe123"/placeholder="Ej: vonssyb o 123456789"/g' src/pages/ApplyPage.jsx

echo "✅ Labels updated"
