import type { Config } from 'tailwindcss';
import { defaultBeigeColors } from './src/colors/defaultBeige';
import { defaultBlueColors } from './src/colors/defaultBlue';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/colors/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      screens: {
        xs: '400px',
      },
      colors: {
        defaultBlue: {
          ...defaultBlueColors,
        },
        defaultBeige: {
          ...defaultBeigeColors,
        },
      },
    },
  },
  plugins: [],
};
export default config;
