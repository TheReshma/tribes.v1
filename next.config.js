/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MORALIS_APPLICATION_ID: process.env.MORALIS_APPLICATION_ID,
    MORALIS_SERVER_ID: process.env.MORALIS_SERVER_ID,
  },
};

module.exports = nextConfig;
