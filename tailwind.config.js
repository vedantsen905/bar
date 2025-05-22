// tailwind.config.js
module.exports = {
    darkMode: 'class', // Enable dark mode using class-based toggling
    content: [
      './src/**/*.{js,ts,jsx,tsx}',  // Make sure Tailwind scans your app's files
    ],
    theme: {
      extend: {
        colors: {
          // Define custom colors if necessary
          camel: '#C19A6B',
        },
      },
    },
     
  };
  