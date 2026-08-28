# MySQL MCP 服务

这个目录提供一个基于 stdio 的 Model Context Protocol 服务，让支持 MCP 的 AI 客户端操作**一套明确授权的 MySQL 数据库**。

服务默认只读。它不会读取 Spring Boot 的 H2 文件，也不会自动复用后端的 root 账号；连接信息全部来自环境变量。

## 工具

| 工具 | 用途 | 默认状态 |
| --- | --- | --- |
| `mysql_health` | 检查连接、数据库名和 MySQL 版本 | 可用 |
| `mysql_list_tables` | 列出当前库的表和视图 | 可用 |
| `mysql_describe_table` | 查看指定表的列定义 | 可用 |
| `mysql_query` | 执行一个参数化只读语句 | 可用 |
| `mysql_execute` | 执行一个明确确认的写入或 DDL 语句 | 默认关闭 |

`mysql_query` 只接受 `SELECT`、`SHOW`、`DESCRIBE`、`EXPLAIN`。所有语句都禁止多条拼接；文件读写、`LOAD DATA`、`LOAD_FILE`、`INTO OUTFILE` 和锁定读取会被拒绝。

## 安装和运行

```powershell
cd C:\Users\魏宇杰\Desktop\666\创客贴\mcp\mysql-server
npm install

$env:MYSQL_HOST = '127.0.0.1'
$env:MYSQL_PORT = '3306'
$env:MYSQL_DATABASE = 'chuangkit'
$env:MYSQL_USER = 'chuangkit_mcp'
$env:MYSQL_PASSWORD = 'replace-with-a-secret'

# 默认只读，不要为了测试方便打开写权限
$env:MYSQL_MCP_ALLOW_WRITE = 'false'
$env:MYSQL_MCP_ALLOW_DDL = 'false'
$env:MYSQL_MCP_MAX_ROWS = '100'

npm start
```

MCP 使用 stdout 传输协议，因此不要在 `server.mjs` 中增加普通控制台输出；启动错误会写到 stderr。

## 接入 MCP 客户端

本项目已经提供 Cursor 项目配置：[`.cursor/mcp.json`](../../.cursor/mcp.json)。它会直接启动 `src/local-server.mjs`，从当前 Windows 用户环境变量读取数据库密码，因此配置文件本身不包含密码。重启或在 Cursor 的 MCP 面板刷新该项目后，启用 `chuangkit-mysql` 即可。

当前本机开发数据库配置为：`127.0.0.1:3307/chuangkit`，账号为 `chuangkit_mcp`，MySQL 容器名为 `chuangkit-mysql-mcp`。这个账号已经收紧为 `SELECT, SHOW VIEW`，AI 默认不能写入。

客户端配置的核心是让它启动 `node` 并把环境变量传给服务。下面是常见 JSON 配置格式，路径和数据库值替换成你的实际值：

```json
{
  "mcpServers": {
    "chuangkit-mysql": {
      "command": "node",
      "args": ["C:\\Users\\魏宇杰\\Desktop\\666\\创客贴\\mcp\\mysql-server\\src\\server.mjs"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_DATABASE": "chuangkit",
        "MYSQL_USER": "chuangkit_mcp",
        "MYSQL_PASSWORD": "replace-with-a-secret",
        "MYSQL_MCP_ALLOW_WRITE": "false",
        "MYSQL_MCP_ALLOW_DDL": "false",
        "MYSQL_MCP_MAX_ROWS": "100"
      }
    }
  }
}
```

如果客户端使用 TOML 配置，可按客户端文档把同样的字段映射到 `command`、`args` 和 `env`。不要把密码提交到 Git；更推荐使用客户端的本机密钥管理或启动服务前注入的环境变量。

## 数据库授权

先创建一个专用账号，只授予 AI 实际需要的库和表。只读示例：

```sql
CREATE USER 'chuangkit_mcp'@'127.0.0.1' IDENTIFIED BY 'use-a-long-random-password';
GRANT SELECT, SHOW VIEW ON chuangkit.* TO 'chuangkit_mcp'@'127.0.0.1';
FLUSH PRIVILEGES;
```

如果确实需要写入，按表授予最小权限，并同时设置 `MYSQL_MCP_ALLOW_WRITE=true`：

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON chuangkit.user_design TO 'chuangkit_mcp'@'127.0.0.1';
```

只有确认需要改表结构时，才额外设置 `MYSQL_MCP_ALLOW_DDL=true` 并授予对应 DDL 权限。`mysql_execute` 还要求调用参数传入精确确认值：

- 写入：`I_UNDERSTAND_WRITE_ACCESS`
- DDL：`I_UNDERSTAND_DDL_ACCESS`

环境变量开关和调用参数确认缺一不可，数据库账号本身的权限仍然是最终边界。

## 验证

```powershell
npm test
npm run check
```

`protocol.test.mjs` 会通过 MCP 内存传输验证工具发现、只读调用和默认拒写。没有真实数据库凭据时，不能用它替代真实连接验证；拿到授权账号后，在启动服务的同一组环境变量下调用 `mysql_health` 即可验证真实连接。
