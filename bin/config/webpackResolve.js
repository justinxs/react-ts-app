import fs from 'node:fs';

export default function webpackResolve({ paths, webpackEnv }) {
  const isEnvProduction = webpackEnv === 'production';
  // Check if TypeScript is setup
  const useTypeScript = fs.existsSync(paths.appTsConfig);
  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes('--profile');

  return {
    extensions: paths.moduleFileExtensions
      .map((ext) => `.${ext}`)
      .filter((ext) => useTypeScript || !ext.includes('ts')),
    alias: {
      ...(isEnvProductionProfile && {
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling'
      }),
      '@': paths.appSrc
    }
  };
}
