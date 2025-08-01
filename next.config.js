/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Disable chunk splitting to avoid chunk loading errors
  experimental: {
    // This will create a single bundle instead of multiple chunks
    // which should help with the chunk loading errors
    outputFileTracingRoot: process.env.NODE_ENV === 'production' ? undefined : process.cwd(),
  },
  webpack: (config, { isServer, dev }) => {
    // Add a rule to handle the undici module
    config.module.rules.push({
      test: /node_modules\/undici\/lib\/web\/fetch\/util\.js$/,
      loader: 'string-replace-loader',
      options: {
        search: /if \(typeof this !== 'object' \|\| this === null \|\| !\(#target in this\)\) {/g,
        replace: 'if (typeof this !== "object" || this === null) {',
      },
    });

    // Optimize for production builds
    if (!dev) {
      // Configure environment for ES5 compatibility
      config.output = {
        ...config.output,
        environment: {
          arrowFunction: false,
          bigIntLiteral: false,
          const: false,
          destructuring: false,
          dynamicImport: false,
          forOf: false,
          module: false,
          optionalChaining: false,
          templateLiteral: false,
        },
      };

      // Reduce chunk splitting to avoid loading errors
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          // Use terser with ES5 output
          new (require('terser-webpack-plugin'))({
            terserOptions: {
              parse: {
                ecma: 5,
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
              },
              mangle: {
                safari10: true,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
          }),
        ],
        splitChunks: {
          cacheGroups: {
            default: false,
            vendors: false,
            // Create a single bundle for all code
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 1,
            },
          },
        },
        runtimeChunk: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;