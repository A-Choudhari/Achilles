/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // local
     BASE_API_URL: "http://localhost:3000",

    GOOGLE_CLIENT_ID: "",
    GOOGLE_SECRET:"",

    NEXT_SECRET: "",
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'www.google.com'],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
