import path from 'node:path';
import fs from 'node:fs';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';

import InterpolateHtmlPlugin from '../utils/InterpolateHtmlPlugin.js';
import progressOptions from './progressOptions.js';

class ForkTsCheckerWarningWebpackPlugin {
  apply(compiler) {
    new ForkTsCheckerWebpackPlugin().apply(compiler);
    const hooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);
    hooks.issues.tap('ForkTsCheckerWarningWebpackPlugin', (issues) =>
      issues.map((issue) => ({ ...issue, severity: 'warning' }))
    );
  }
}

export default function plugins({ paths, clientEnv, webpackEnv }) {
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';
  const disableProgressPlugin = process.env.DISABLE_PROGRESS_PLUGIN === 'true';
  const enableAssetsManiFest = process.env.ENABLE_ASSETS_MANIFEST === 'true';
  const useTypeScript = fs.existsSync(paths.appTsConfig);

  const ForkTsCheckerPlugin =
    process.env.TSC_COMPILE_ON_ERROR === 'true'
      ? ForkTsCheckerWarningWebpackPlugin
      : ForkTsCheckerWebpackPlugin;

  return [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.appPublic,
          filter: (resourcePath) =>
            path.normalize(resourcePath) !== paths.appHtml,
          to: paths.appBuild,
          noErrorOnMissing: true
        }
      ]
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          inject: true,
          template: paths.appHtml
        },
        isEnvProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
              }
            }
          : undefined
      )
    ),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, clientEnv.raw),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV is set to production
    // during a production build.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(clientEnv.stringified),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
    }),
    enableAssetsManiFest &&
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            (fileName) => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles
          };
        }
      }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    // TypeScript type checking
    useTypeScript &&
      new ForkTsCheckerPlugin({
        async: isEnvDevelopment,
        typescript: {
          typescriptPath: 'typescript',
          configOverwrite: {
            compilerOptions: {
              sourceMap: isEnvProduction
                ? shouldUseSourceMap
                : isEnvDevelopment,
              skipLibCheck: true,
              inlineSourceMap: false,
              declarationMap: false,
              noEmit: true,
              incremental: true,
              tsBuildInfoFile: paths.appTsBuildInfoFile
            }
          },
          context: paths.appPath,
          diagnosticOptions: {
            syntactic: true
          },
          mode: 'write-references'
          // profile: true,
        },
        issue: {
          // This one is specifically to match during CI tests,
          // as micromatch doesn't match
          // '../cra-template-typescript/template/src/App.tsx'
          // otherwise.
          include: [
            { file: '../**/src/**/*.{ts,tsx}' },
            { file: '**/src/**/*.{ts,tsx}' }
          ],
          exclude: [
            { file: '**/src/**/__tests__/**' },
            { file: '**/src/**/?(*.){spec|test}.*' },
            { file: '**/src/setupProxy.*' },
            { file: '**/src/setupTests.*' }
          ]
        },
        logger: {
          infrastructure: 'silent'
        }
      }),
    !disableESLintPlugin && new ESLintPlugin(),
    !disableProgressPlugin && new webpack.ProgressPlugin(progressOptions)
  ];
}
