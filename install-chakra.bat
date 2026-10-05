@echo off
echo Installing Chakra UI dependencies...
cd Frontend
npm install @chakra-ui/react@^2.8.2 @emotion/react@^11.11.1 @emotion/styled@^11.11.0 framer-motion@^10.16.4
echo.
echo Chakra UI installation complete!
echo.
echo Next steps:
echo 1. Run 'npm run dev' to start the development server
echo 2. Check the CHAKRA_UI_MIGRATION.md guide for component conversion patterns
echo 3. Gradually migrate components from Tailwind to Chakra UI
pause