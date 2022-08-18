// https://prettier.io/docs/en/options.html#print-width

module.exports = {
  // 字符串统一使用单引号
  singleQuote: true,
  jsxSingleQuote: true,
  // 限定换行符
  endOfLine: 'crlf',
  // 对象多行结尾加逗号 es5|none|all
  // {
  //   a: 1,
  //   b: 2,
  // }
  trailingComma: 'none',
  // 一行超过多少字符换行
  printWidth: 80,
  // tab占多少空格
  tabWidth: 2,
  // 代码结尾分号
  semi: true,
  // 对象首尾加空格
  bracketSpacing: true,
  // html标签结尾>符号是否不换行
  bracketSameLine: false,
  // 箭头函数，只有一个参数时候是否加括号()always|avoid
  arrowParens: 'always',
  // 是否缩进 script and style tags in Vue files
  vueIndentScriptAndStyle: false,
  // css/ignore/strict
  htmlWhitespaceSensitivity: 'css',
  // <always|never|preserve>
  proseWrap: 'preserve'
};
