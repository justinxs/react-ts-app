import fs from 'node:fs';
import path from 'node:path';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import getCSSModuleLocalIdent from '../utils/getCSSModuleLocalIdent.js';

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.(less)$/;
const lessModuleRegex = /\.module\.(less)$/;

export default function cssLoaders({ paths, webpackEnv }) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
  // Check if Tailwind config exists
  const useTailwind = fs.existsSync(
    path.join(paths.appPath, 'tailwind.config.js')
  );
  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && 'style-loader',
      {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: paths.publicUrlOrPath.startsWith('.')
          ? { publicPath: '../../' }
          : {}
      },
      {
        loader: 'css-loader',
        options: cssOptions
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            ident: 'postcss',
            config: false,
            plugins: !useTailwind
              ? [
                  'postcss-flexbugs-fixes',
                  [
                    'postcss-preset-env',
                    {
                      autoprefixer: {
                        flexbox: 'no-2009'
                      },
                      stage: 3
                    }
                  ],
                  'postcss-normalize'
                ]
              : [
                  'tailwindcss',
                  'postcss-flexbugs-fixes',
                  [
                    'postcss-preset-env',
                    {
                      autoprefixer: {
                        flexbox: 'no-2009'
                      },
                      stage: 3
                    }
                  ]
                ]
          },
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment
        }
      }
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: 'resolve-url-loader',
          options: {
            sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
            root: paths.appSrc
          }
        },
        typeof preProcessor === 'string'
          ? {
              loader: preProcessor,
              options: {
                sourceMap: true
              }
            }
          : preProcessor
      );
    }
    return loaders;
  };

  return [
    {
      test: cssRegex,
      exclude: cssModuleRegex,
      use: getStyleLoaders({
        importLoaders: 1,
        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        modules: {
          mode: 'icss'
        }
      }),
      sideEffects: true
    },
    {
      test: cssModuleRegex,
      use: getStyleLoaders({
        importLoaders: 1,
        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        modules: {
          mode: 'local',
          getLocalIdent: getCSSModuleLocalIdent
        }
      })
    },
    {
      test: sassRegex,
      exclude: sassModuleRegex,
      use: getStyleLoaders(
        {
          importLoaders: 3,
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
          modules: {
            mode: 'icss'
          }
        },
        'sass-loader'
      ),
      sideEffects: true
    },
    {
      test: sassModuleRegex,
      use: getStyleLoaders(
        {
          importLoaders: 3,
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
          modules: {
            mode: 'local',
            getLocalIdent: getCSSModuleLocalIdent
          }
        },
        'sass-loader'
      )
    },
    {
      test: lessRegex,
      exclude: lessModuleRegex,
      use: getStyleLoaders(
        {
          importLoaders: 3,
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
          modules: {
            mode: 'icss'
          }
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
            lessOptions: {
              javascriptEnabled: true
            }
          }
        }
      ),
      sideEffects: true
    },
    {
      test: lessModuleRegex,
      use: getStyleLoaders(
        {
          importLoaders: 3,
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
          modules: {
            mode: 'local',
            getLocalIdent: getCSSModuleLocalIdent
          }
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
            lessOptions: {
              javascriptEnabled: true
            }
          }
        }
      )
    }
  ];
}
