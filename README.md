<!--
@Author: songqi
@Date:   2016-07-19
@Email:  songqi@benmu-health.com
@Last modified by:   songqi
@Last modified time: 2017-04-06
-->

## 配置文件

准备简单的写一个启动工具，能迅速搭建项目，并进入开发。

工具是基于 `gulp + webpack`，自己写了一些简单的中间件能将线上的静态资源请求导向线下，并配有一些 `gulp` 的服务。

经过一段时间的迭代，并没有想到已经有 7 个命令了。下面是 `BM -h` 执行出来的结果，有每个命令的说明。

现在已经支持 `angularjs`、`vue1 全家桶`、`vue2 全家桶`、`weex`、`es6`等功能了。

还能初始化一套以 `vue2` 为基础的底层框架。直接能上手写业务。

    ===================== BM 开发工具 ====================

     init            # 初始化目录
     install         # 安装bower依赖
     min             # 压缩打包
     minWeex         # 压缩打包上线 weex 项目
     mock            # 启动一个 mock 服务
     server          # 启动服务
     uninstall       # 卸载bower依赖
     update          # 更新框架代码

## `init`

### 使用

    BM init     // 根据提示执行

### 说明

创建项目初始化，根据提示会帮你创建一个项目，项目目录是前端硬性规定的目录结构，包含一些必要的服务。

### 不带参数

会初始化出来一个项目，是特定的项目目录，也能统一和标准化目录。

### -f 模板名称

模板的书写按照 bmfe-mobil-template 的方式书写

## `update`

### 使用

    sudo update

### 说明

当使用我们的框架命令初始化的项目时，我们可以自动化的帮你更新我们的框架修改，并不会影响你之后的代码修改

### 不带参数

会从 `config.js` 中读取 `frame` 配置，来选择更新的框架

### -f 框架名

目前已经支持的框架：`vue2`

会从参数 -f 后面来选择使用什么框架更新

## `server`

### 使用

    sudo BM server      // sudo 是因为默认启动 80 端口需要 sudo

### 说明

是最核心的命令，用于开发时启动的服务命令，能解决开发时的所有问题。

启动一个服务，目前服务的配置还只能写到配置文件中。做到一人配置其他项目开发也可用。

启动服务还可以根据配置启动多个代理和一个 `mock server`，可以便于前期开发，开发时写入假数据，完全分离前后端开发。

并且能支持 `https` 的服务，`-s` 或者 `--ssl` 加`https`证书路径，即可启动一个`https`的服务，也可以配置端口。

发布之后，线上的会生成相应版本号的静态资源文件。启动服务之后会拦截到这个请求将这个请求转到线下。`（所以项目名中不能出现 @ 符号）`

服务支持 `cors` 跨域。在加上本身的代理。开发，线上调试不需要任何代理。

支持 `vue`、`coffee`、`json`、`es6`、`jsx` 等语法。

## `min`

### 使用

    sudo BM min

### 说明

打包压缩开发时的各种文件，压缩出一个 dist 文件准备发布。

打包完成后自动将打包好后的 `version` 回写到 `html` 中，在完全分离的项目中已经可以做到线下开发，一键发布。

启动多线程打包。如果项目工程特别大。引入的资源文件特别多时，比 `gulp` 和 `webpack` 打包效率提高很多倍，并且在优化之后，比 webpack 配置的打包要小。

## `minWeex`

### 使用

    sudo BM minWeex

### 说明

在接入 `weex` 开发之后，理所当然需要对应 `weex` 有一套编译服务，只需要在 `config.js 文件中加入 weex: true`。(目前只支持 vue2 写法的 weex 项目)

这个命令是压缩 `weex` 代码的，由于客户端还需要远程更新包，并且做好包的版本控制，所以压缩需要生成一个 `.zip` 文件，并且生成一个 `config` 文件用于做包依赖的标识

    // APP 的唯一标识符
    'appName': 'app-benmu-health',
    // js 获取的基本地址
    'jsPath': 'https://fe.benmu-health.com/app/',
    // 请求后端服务的固定地址
    'versionSavePath': '存储 version 号的接口',
    // 依赖最低版本的 IOS 和 Android 的版本号
    'version': {
        'android': '1.0.0',
        'iOS': '2.0.0'
    }

上面的服务是为了自动做 `js` 代码的更新。客户端需要带 `appName`、`version`、`jsVersion` 向后端服务发起请求，得到是否需要下载 `js` 并更新

如果不需要这个服务，可以只用配置 `version` 参数，会生成一个 `version.json`，这个 `json` 文件会得到一堆参数，用于表示 `app` 的依赖关系

## `install` 和 `uninstall`

### 使用

    sudo install xxx

### 说明

这个命令是 `jjwblie` 贡献的

目前其实已经废弃了，我们的包管理还是直接通过 `npm` 来做的，当时走了很多弯路，开始的时候服务器上 `npm` 非常慢，所以选了 `bower` 这个曲折的方案

通过私有源的支持，直接支持类 bower 私有库。

配置文件也会在 config.js 中自动生成。一个配置文件解决所有问题。

## `mock`

### 使用

    sudo mock

### 说明

在开发小程序的时候发现需要一个单独的 `mock` 服务，就把 `mock` 命令从 `server` 中拆解出来了

## `注意`

由于 `vue2` 对于 `webpack loader` 使用的不规范，所以导致我们 `vue2` 相关的 `loader` 需要写在项目中，不然找不到

## 内部详解

> * `package.json`：用于构建工具的包依赖。
> * `bower.json`：用于前端静态资源的包依赖。
> * `webpack.config.js`：用于 `js` 的动态合并，提供 `require`，自动读取 `前端包依赖`。
> * `gulpfile.js`：核心工具配置。主要功能有：基础服务，启动即开一个页面到该服务，清空 `dist` 文件夹，监听文件变动，文件变动自动刷新，合并压缩 `HTML`、`JS`、`CSS`，angularjs template 打包，mock 数据。
> * 【重要】 `config.json` 对应的项目配置文件

目前已改为一个配置文件 `config.js`。

## 项目初始化

初始化工具组件：`npm install`。

PS：在加载私有包依赖时统一在后面加上 `--save-dev`。

## 项目启动

启动命令：

    开发环境启动：`sudo BM server`

    线上环境启动：`sudo BM min`

## 目录结构

    ·

    |-- .gitignore          （需要忽略的文件：/node_modules、/bower_components、/dist）

    |-- node_modules        （node 依赖）

    |-- html                （对外输出页面）

    |-- src                 （资源文件）

        |__ js              （JS 资源）

            |__ exports     （对外暴露的 JS，用于页面中引用）

            |__ views       （切分 views，用于模块化）

            |__ others      （其他文件，如：common、utils）

        |__ css             （CSS 资源）

            |__ exports     （对外暴露的 CSS）

            |__ others      （其他文件）

        |__ html            （切图同学存放 HTML 的地方）

        |__ mock            （mock 数据存放目录，mock 数据写法请参照 gulp-mock-server）

        |__ templates       （angularjs templates 存放模板的地方）

## 配置文件

    {
        // weex 项目的特殊配置 非 weex 项目不用写
        'weex': true,
        // vue2 项目的特殊配置 非 vue2 项目不用写
        'vue2': true,
        // gulp server 的配置
        "server": {
            "path": "../",
            "port": 80
        }
        // 代理服务的配置
        "proxy": [{
            "route": "/proxy",                  // 代理拦截目录
            "target": "127.0.0.1:52077/proxy"   // 转发的目录
        },{
            "route": "/name",
            "target": "127.0.0.1:52077/index"
        }],
        // mock server 的配置
        "mockServer": {
            "port": 52077,
            "mockDir": ""
        },
        // 默认打开的页面
        "openPath": "http://fe.benmu-health.com/scaffold/dist/html/index.html",
        // 对外暴露的 js、css 文件
        "exports": [
            "css/exports!dir-css",      // 将 css/exports 文件夹中的所有 css 对外暴露
            "css/aaa/bbb.scss",         // 将 css/aaa/bbb.scss 文件中的所有 css 对外暴露
            "js/exports!dir-js",        // 将 js/exports 文件中的所有 js 对外暴露
            "js/exports/karyn.js"       // 将 js/exports/karyn.js 文件中的所有 js 对外暴露
        ],
        // alias 重命名
        "alias": {
            "Views": "js/views",
            "Common": "js/common",
            "Utils": "js/utils"
        }
    }

## 部分规范

目前前端的规范较少。我们还是希望前期通过规范来约束大家的代码习惯与质量。突然添加可能想到比较少，但我希望大家想到一点就在这个文档里进行添加。先添加到一定量，我们再来整理先后顺序。

### 脚手架规范

#### `mock` 数据的使用

    只有在 dev 环境下才能使用，配置文件在 gulpfile 中的 MOCKHOST 中。

    服务默认是启动在 http://127.0.0.1:52078/，对应的 url 是 mock 文件中的映射。

    mock 数据的格式使用请参照 gulp-mock-server

#### `gulp server proxy`

支持数组和对象两种格式。

##### 最简配置（如果 mock server 的地址是 127.0.0.1:52077 ）

    {
        "route": "/proxy"
    }

    // 访问地址

    http://127.0.0.1/proxy/127.0.0.1:52077/index/index?id=123

##### 对象配置

    {
        "route": "/proxy",                  // 代理拦截目录
        "target": "127.0.0.1:52077/proxy"   // 转发的目录
    }

    // 访问地址

    http://127.0.0.1/proxy/index?id=123

    {
        "route": "/proxy",                  // 代理拦截目录
        "target": "127.0.0.1:52077"   // 转发的目录
    }

    // 访问地址

    http://127.0.0.1/proxy/index/index?id=123

##### 数组配置

    [{
        "route": "/proxy",                  // 代理拦截目录
        "target": "127.0.0.1:52077/proxy"   // 转发的目录
    },{
        "route": "/name",
        "target": "127.0.0.1:52077/index"
    }]

    // 访问地址

    http://127.0.0.1/proxy/index?id=123
    http://127.0.0.1/name/index?id=123


# javascript 编写规范

## 数组

##### 向数组增加元素时使用 Array#push 来替代直接赋值。
```javascript
  var someStack = [];
    // bad
    someStack[someStack.length] = 'abracadabra';
    // good
    someStack.push('abracadabra');
```
ps：尽量不要频繁取值。

#### 当你需要拷贝数组时，使用 Array#slice
```javascript
    var item = [1,2,3];
    var item_len = item.legth;
    var itemArr = [];
    var i = '';
    // bad
    for(i = 0; i < item_len; i++){
        itemArr[i] = item[i];
    }
    // good
    itemArr = item.slice();
```
#### 使用 Array#slice 将类数组对象转换成数组
```javascript
    function trigger() {
      var args = Array.prototype.slice.call(arguments);
      ...
}
```

## 字符串

#### 使用单引号，包引字符串
``` javascript

var str = 'helloe world!';

```

#### 超过 100 个字符的字符串应该使用连接符写成多行。
```javascript
var str = '<p>你好</p>'+
        '<p>你好<p>'+
        '<p>你好</p>';

```
ps：尽量用“+”，不用“\”，若字符很长，需折行，不用折行，会影响性能读取问题。

#### 程序化生成的字符串使用 Array#join 连接而不是使用连接符。尤其是 IE 下
```javascript
    for (i = 0; i < length; i++) {
        //bad
        items += '<li>' + messages[i].message + '</li>';
        //good
        items[i] = '<li>' + messages[i].message + '</li>';
    }

    //bad
        return '<ul>' + items + '</ul>';
    //good
        return '<ul>' + items.join('') + '</ul>';
```
ps：for循环，length提前取出。


```javascript
{
    "rules": {
        //官方文档 http://eslint.org/docs/rules/
        //参数：0 关闭，1 警告，2 错误

        // "quotes": [0, "single"],                  //建议使用单引号
        // "no-inner-declarations": [0, "both"],     //不建议在{}代码块内部声明变量或函数
        "no-extra-boolean-cast": 1, //多余的感叹号转布尔型
        "no-extra-semi": 1, //多余的分号
        "no-extra-parens": 0, //多余的括号
        "no-empty": 1, //空代码块
        "no-use-before-define": [0, "nofunc"], //使用前未定义
        "complexity": [1, 10], //圈复杂度大于10 警告

        //常见错误
        "comma-dangle": [1, "never"], //定义数组或对象最后多余的逗号
        "no-debugger": 1, //debugger 调试代码未删除
        "no-console": 0, //console 未删除
        "no-constant-condition": 2, //常量作为条件
        "no-dupe-args": 2, //参数重复
        "no-dupe-keys": 2, //对象属性重复
        "no-duplicate-case": 2, //case重复
        "no-empty-character-class": 2, //正则无法匹配任何值
        "no-invalid-regexp": 2, //无效的正则
        "no-func-assign": 2, //函数被赋值
        "valid-typeof": 1, //无效的类型判断
        "no-unreachable": 2, //不可能执行到的代码
        "no-unexpected-multiline": 2, //行尾缺少分号可能导致一些意外情况
        "no-sparse-arrays": 1, //数组中多出逗号
        "no-shadow-restricted-names": 2, //关键词与命名冲突
        "no-undef": 0, //变量未定义
        "no-unused-vars": 1, //变量定义后未使用
        "no-cond-assign": 2, //条件语句中禁止赋值操作
        "no-native-reassign": 2, //禁止覆盖原生对象
        "no-mixed-spaces-and-tabs": 0,

        //代码风格优化
        "no-irregular-whitespace": 0,
        "no-else-return": 0, //在else代码块中return，else是多余的
        "no-multi-spaces": 0, //不允许多个空格
        "key-spacing": [0, {
            "beforeColon": false,
            "afterColon": true
        }], //object直接量建议写法 : 后一个空格前面不留空格
        "block-scoped-var": 1, //变量应在外部上下文中声明，不应在{}代码块中
        "consistent-return": 1, //函数返回值可能是不同类型
        "accessor-pairs": 1, //object getter/setter方法需要成对出现
        "dot-location": [1, "property"], //换行调用对象方法  点操作符应写在行首
        "no-lone-blocks": 1, //多余的{}嵌套
        "no-empty-label": 1, //无用的标记
        "no-extend-native": 1, //禁止扩展原生对象
        "no-floating-decimal": 1, //浮点型需要写全 禁止.1 或 2.写法
        "no-loop-func": 1, //禁止在循环体中定义函数
        "no-new-func": 1, //禁止new Function(...) 写法
        "no-self-compare": 1, //不允与自己比较作为条件
        "no-sequences": 1, //禁止可能导致结果不明确的逗号操作符
        "no-throw-literal": 1, //禁止抛出一个直接量 应是Error对象
        "no-return-assign": [1, "always"], //不允return时有赋值操作
        "no-redeclare": [1, {
            "builtinGlobals": true
        }], //不允许重复声明
        "no-unused-expressions": [0, {
            "allowShortCircuit": true,
            "allowTernary": true
        }], //不执行的表达式
        "no-useless-call": 1, //无意义的函数call或apply
        "no-useless-concat": 1, //无意义的string concat
        "no-void": 1, //禁用void
        "no-with": 1, //禁用with
        "space-infix-ops": 0, //操作符前后空格
        "valid-jsdoc": [0, {
            "requireParamDescription": true,
            "requireReturnDescription": true
        }], //jsdoc
        "no-warning-comments": [1, {
            "terms": ["todo", "fixme", "any other term"],
            "location": "anywhere"
        }], //标记未写注释
        "curly": 0 //if、else、while、for代码块用{}包围
    },
    "env": {
        "es6": true,
        "node": true,
        "browser": true,
        "jquery": true
    },
    "parser": "babel-eslint",
    "ecmaFeatures": {
        "jsx": true
    },
    "plugins": [
        //"react",//写react安装该插件
        "eslint-plugin-html"
    ]
}
```
