# jx3box-build-common  

数据表构建通用工具库
在进行数据构建的时候总是会遇到一些熟悉的操作  
比如需要一个日志输出器，tab，txt文件读取什么的。  
但是目前的写法是有一个utils.js文件里面写了一些各个构件库用的方法  
为了标准化，弄了这个仓库用于统一各个数据构建仓库中使用的方法  

```js
const {...} = require('@jx3box/jx3box-build-common');
```

## API

### UI

#### Logger

操作过程中需要往控制台输出当前进度、在干什么等等

- info
- warn
- error
- success

#### ProgressBar

用于展示一个进度条，在处理大文件的时候比较有必要  

- buildProgressBar

### File About

文件操作，用于读写文件  

#### 表格读

用于读写常见的表格文件，一般而言。剑三的游戏数据文件都是`GBK`编码的`tsv`格式  
即 字段之间使用`\t`分隔，第一行是标题，第二行是默认数据，第三行开始是数据体  
构建过程中要求读取这些数据文件之后进行自己的合表等操作  

- readTable

#### 其他文件读取

也会有一些文件采用ini格式，例如字体等各种枚举格式  
也有lua格式，`return {...}`

- readIni
- readLuaTable
- parseLua

#### 写文件

构建结果一般使用csv导出，如果对于较大的文件（超过100M）可能会需要做文件切片

- writeCsv