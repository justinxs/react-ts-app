## 在全局变量的声明文件中，是不允许出现 import, export 关键字的。一旦出现了，那么他就会被视为一个 npm 包或 UMD 库，就不再是全局变量的声明文件了。
## 故当我们在书写一个全局变量的声明文件时，如果需要引用另一个库的类型，那么就必须用三斜线指令 (/// <reference types="node" />)
## 注意，三斜线指令必须放在文件的最顶端，三斜线指令的前面只允许出现单行或多行注释