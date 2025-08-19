## mac 上面用Apache2 访问perl cgi

### 1. 配置 Apache 支持 CGI

<Code language="sh">
  \#编辑httpd.conf
  sudo vi /etc/apache2/httpd.conf
</Code>

**确保以下配置被取消注释（即前面没有 #）：**
<Code language="sh">
  LoadModule cgi_module libexec/apache2/mod_cgi.so
</Code>

### 2. MAC 自带的 apache2 cgi 路径`/Library/WebServer/CGI-Executables`

<Code language="sh">
  cd /Library/WebServer/CGI-Executables
  touch hello.cgi
</Code>

`hello.cgi`内容

<Code language="perl">
  \#!/usr/bin/perl
  use strict;
  use warnings;
  use CGI qw(:standard);

  # 创建一个 CGI 对象
  my $cgi = CGI->new;

  # 输出 HTTP 头部
  print $cgi->header('text/html');

  # 输出 HTML 内容
  print $cgi->start_html('My Perl CGI Script');
  print $cgi->h1('Hello, World!');
  print $cgi->end_html;
</Code>

### 3. 启动 apache2 

相关命令

<Code language="sh">
  \# 启动
  sudo apachectl restart
  \# 停止
  sudo apachectl  stop
  \# 重启
  sudo apachectl   restart
  \# error log 查看
  cat /var/log/apache2/error_log
</Code>  

启动之后访问如下地址 http://localhost/cgi-bin/hello.cgi  如果出错，查看log
