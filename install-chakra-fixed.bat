@echo off
echo Installing Chakra UI dependencies...
cd Frontend
npm install @chakra-ui/react@^2.8.2 @chakra-ui/icons@^2.1.1 @emotion/react@^11.11.1 @emotion/styled@^11.11.0 framer-motion@^10.16.4
echo.
echo Chakra UI installation complete!
echo.
echo Dependencies installed:
echo - @chakra-ui/react (main library)
echo - @chakra-ui/icons (icon components)
echo - @emotion/react (CSS-in-JS)
echo - @emotion/styled (styled components)
echo - framer-motion (animations)
echo.
echo Run 'npm run dev' to start development server
pause