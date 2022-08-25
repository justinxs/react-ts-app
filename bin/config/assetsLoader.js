export default function assetsLoaders({ process_env }) {
  const imageInlineSizeLimit = parseInt(
    process_env.IMAGE_INLINE_SIZE_LIMIT || '10000'
  );

  return [
    // TODO: Merge this config once `image/avif` is in the mime-db
    // https://github.com/jshttp/mime-db
    {
      test: [/\.avif$/],
      type: 'asset',
      mimetype: 'image/avif',
      parser: {
        dataUrlCondition: {
          maxSize: imageInlineSizeLimit
        }
      }
    },
    // "url" loader works like "file" loader except that it embeds assets
    // smaller than specified limit in bytes as data URLs to avoid requests.
    // A missing `test` is equivalent to a match.
    {
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize: imageInlineSizeLimit
        }
      }
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            prettier: false,
            svgo: false,
            svgoConfig: {
              plugins: [{ removeViewBox: false }]
            },
            titleProp: true,
            ref: true
          }
        },
        {
          loader: 'file-loader',
          options: {
            name: 'static/media/[name].[hash].[ext]'
          }
        }
      ],
      issuer: {
        and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
      }
    }
  ];
}
