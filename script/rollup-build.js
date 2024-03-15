const cmj = require("@rollup/plugin-commonjs");
const tys = require("rollup-plugin-typescript2");
const { terser } = require("rollup-plugin-terser");
const json = require("@rollup/plugin-json");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { DEFAULT_EXTENSIONS } = require("@babel/core");
const rollup = require("rollup");
const path = require("path");
const fs = require("fs");
const minimist = require("minimist");

const extensions = [".ts", ".tsx", ...DEFAULT_EXTENSIONS];

const target = minimist(process.argv.slice(2))._[0];

// 请继续浏览下面的内容获取更多关于这个选项的细节
const getProjectPath = () => {
  return path.resolve(__dirname, "../", "packages", target);
};
const getPath = () => {
  let l = (file = "index.ts") => path.resolve(getProjectPath(), "src", file);
  if (fs.statSync(l()).isFile()) {
    return l();
  } else {
    return l("index.js");
  }
};
const inputOptions = {
  // 核心输入选项
  input: getPath(), // 有条件地需要
  plugins: [
    tys({
      include: ["*.ts+(|x)", "**/*.ts+(|x)"],
    }),
    cmj(),
    terser(),
    json(),
    nodeResolve({
      extensions: extensions,
    }),
  ],
};

// 你可以从相同的输入创建多个输出，
// 以生成例如 CommonJS 和 ESM 这样的不同格式
// const outputOptionsList = [{...}, {...}];
const types = ["umd", "cjs", "iife"];
const outputOptionsList = types.map((v) => {
  return {
    name: "LuckUtils",
    sourcemap: true,
    file: getProjectPath() + `/dist/${target}.${v}.js`,
    format: v,
    inlineDynamicImports: true,
  };
});
build();

async function build() {
  let bundle;
  let buildFailed = false;
  try {
    // 启动一次打包
    bundle = await rollup.rollup(inputOptions);
    // 一个文件名数组，表示此产物所依赖的文件
    console.log(bundle.watchFiles);
    await generateOutputs(bundle);
  } catch (error) {
    buildFailed = true;
    // 进行一些错误报告
    console.error(error);
  }
  if (bundle) {
    // 关闭打包过程
    await bundle.close();
  }
  process.exit(buildFailed ? 1 : 0);
}

async function generateOutputs(bundle) {
  for (const outputOptions of outputOptionsList) {
    // 生成特定于输出的内存中代码
    // 你可以在同一个 bundle 对象上多次调用此函数
    // 使用 bundle.write 代替 bundle.generate 直接写入磁盘
    await bundle.write(outputOptions);
  }
}
