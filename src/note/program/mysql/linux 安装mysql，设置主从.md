

## 一. 安装mysql（v5.6.40）

#### 1. 下载解压

<Code language="shell">

wget https\://cdn.mysql.com/archives/mysql-5.6/mysql-5.6.40-linux-glibc2.12-x86_64.tar.gz
tar -xzvf mysql-5.6.40-linux-glibc2.12-x86_64.tar.gz
</Code>

#### 2. 移动到安装目录

<Code language="shell">
sudo mv mysql-5.6.40-linux-glibc2.12-x86_64 /usr/local/
cd /usr/local/
sudo mv mysql-5.6.40-linux-glibc2.12-x86_64 mysql
</Code>

#### 3. 创建用户组mysql，创建用户mysql并将其添加到用户组mysql中，并赋予读写权限

<Code language="shell">
sudo groupadd mysql
sudo useradd -r -g mysql mysql
sudo chown -R mysql mysql/
sudo chgrp -R mysql mysql/
</Code>

#### 4. 创建数据库文件存放目录

<Code language="shell">
sudo mkdir -p /data/mysql
sudo chown -R mysql:mysql /data/mysql
</Code>

#### 5. 初始化数据库

<Code language="shell">
cd mysql
sudo ./scripts/mysql_install_db --user=mysql --datadir=/data/mysql
</Code>

**注意 遇到perl错误**

<Code language="shell">
perl: warning: Setting locale failed.
perl: warning: Please check that your locale settings:
	LANGUAGE = (unset),
	LC_ALL = (unset),
	LC_CTYPE = "UTF-8",
	LANG = "ja_JP.UTF-8"
    are supported and installed on your system.
perl: warning: Falling back to the standard locale ("C").
FATAL ERROR: please install the following Perl modules before executing ./scripts/mysql_install_db:
Data::Dumper

// 解决
yum install -y perl-Module-Install

然后初始化
</Code>

#### 6. 配置文件

<Code language="shell">
cp support-files/my-default.cnf /etc/my.cnf
vim /etc/my.cnf
basedir = /usr/local/mysql
datadir = /data/mysql
port    = 3306
</Code>

#### 7. 复制启动脚本

<Code language="shell">
cp support-files/mysql.server /etc/init.d/mysqld
chmod 755 /etc/init.d/mysqld
vim /etc/init.d/mysqld
basedir=
datadir=/data/mysql
</Code>

#### 8. 后续设置

<Code language="shell">
// 开机启动 
chkconfig mysqld on
service mysqld start

// 加入环境变量
vim /etc/profile
export PATH=/usr/local/mysql/bin:$PATH
source /etc/profile
</Code>

## 二. 主从配置

#### 1. Mysql01，Mysql02 配置

<Code language="shell">
vi /etc/my.cnf
\#mysql cnf
[mysqld]
basedir = /usr/local/mysql
datadir = /data/mysql
socket = /usr/local/mysql/mysql.sock
\#default config
sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
\#master slave config
server-id = 1 //两台应该不一样
log-bin = mysql-bin
binlog-format = mixed
[mysqld_safe]
log-error = /var/log/mysqld.log
pid-file = /var/run/mysqld/mysqld.pid
replicate-do-db = all 
[client]
port = 3306
socket = /usr/local/mysql/mysql.sock
// 修改完后重启两台db
service mysql restart
service mysqld restart
</Code>

#### 2. 登录mysql01，创建用于同步的账户

Account: repl

pass: 123456

<Code language="shell">
GRANT REPLICATION SLAVE ON \*.\* to 'repl'@'%' identified by '123456';
mysql> GRANT REPLICATION SLAVE ON *.* to 'repl'@'%' identified by '123456';
Query OK, 0 rows affected (0.00 sec)
mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000010 |      318 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

mysql> 
</Code>

#### 3. 登录mysql02，执行以下语句

**ec2-user@**不需要，只写ip（xxxxx）就行

<Code language="shell">
change master to master_host='xxxxx',master_user='repl',master_password='123456',master_log_file='mysql-bin.000010',master_log_pos=318;
命令参数解释：
// Master 的 IP 地址
master_host='xxxx'
// 用于同步数据的用户（在 Master中授权的用户）
master_user='repl' 
// 同步数据用户的密码
master_password='123456' 
// 指定 Slave 从哪个日志文件开始读复制数据（可在 Master 上使用 show master status 查看到日志文件名）
master_log_file='mysql-bin.000010' 
// 从哪个 POSITION 号开始读
master_log_pos=318 
</Code>

<Code language="shell">
mysql> change master to master_host='xxxxx',master_user='repl',master_password='123456',master_log_file='mysql-bin.000010',master_log_pos=318;
Query OK, 0 rows affected, 2 warnings (0.03 sec)

mysql> start slave;
Query OK, 0 rows affected (0.01 sec)

mysql> show slave status\G 

               Slave_IO_State: Waiting for master to send event
                  Master_Host: xxxxx
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000012
          Read_Master_Log_Pos: 120
               Relay_Log_File: ip-xxxx-relay-bin.000004
                Relay_Log_Pos: 283
        Relay_Master_Log_File: mysql-bin.000012
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 120
              Relay_Log_Space: 628
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 1
                  Master_UUID: 32edae9b-a7e4-11eb-b450-067a4e69efe7
             Master_Info_File: /data/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0
1 row in set (0.00 sec)
</Code>

#### 4. 测试是否同步

1. 登录MySQL01，创建一个数据库，一个表，插入一条数据

<Code language="shell">
mysql> create database test_async_db;
Query OK, 1 row affected (0.00 sec)

mysql> use test_async_db;
Database changed
mysql> create table test(id int(3),name char(5));
Query OK, 0 rows affected (0.02 sec)

mysql> insert into test values (001,'async');
Query OK, 1 row affected (0.00 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| test               |
| test_async_db      |
+--------------------+
5 rows in set (0.00 sec)

mysql> select * from test;
+------+-------+
| id   | name  |
+------+-------+
|    1 | async |
+------+-------+
1 row in set (0.00 sec)
</Code>

2. 查看mysql02是否同步

<Code language="shell">
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| test               |
| test_async_db      |
+--------------------+
5 rows in set (0.00 sec)

mysql> select * from test;
+------+-------+
| id   | name  |
+------+-------+
|    1 | async |
+------+-------+
1 row in set (0.00 sec)
</Code>

#### 5. 配置mysql02为主

1. 登录mysql02，创建用于同步的账户repl，密码为123456，并查询master状态，记下file名称和posttion数值，并查询master状态

<Code language="shell">
mysql> GRANT REPLICATION SLAVE ON \*.* to 'repl'@'%' identified by '123456';
Query OK, 0 rows affected (0.01 sec)

mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |      323 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
</Code>

2. 登录mysql01

<Code language="shell">
change master to master_host='xxxxx',master_user='repl',master_password='123456',master_log_file='mysql-bin.000001',master_log_pos=323;
命令参数解释：
// Master 的 IP 地址
master_host='xxxxx'
// 用于同步数据的用户（在 Master中授权的用户）
master_user='repl' 
// 同步数据用户的密码
master_password='123456' 
// 指定 Slave 从哪个日志文件开始读复制数据（可在 Master 上使用 show master status 查看到日志文件名）
master_log_file='mysql-bin.000009' 
// 从哪个 POSITION 号开始读
master_log_pos=318 
</Code>

<Code language="shell">
mysql> change master to master_host='xxxxx',master_user='repl',master_password='123456',master_log_file='mysql-bin.000001',master_log_pos=323;
Query OK, 0 rows affected, 2 warnings (0.01 sec)

mysql> start slave;
Query OK, 0 rows affected (0.01 sec)

mysql> show slave status\G

               Slave_IO_State: Waiting for master to send event
                  Master_Host: xxxxx
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000001
          Read_Master_Log_Pos: 323
               Relay_Log_File: ip-xxxxx-relay-bin.000002
                Relay_Log_Pos: 283
        Relay_Master_Log_File: mysql-bin.000001
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 323
              Relay_Log_Space: 465
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 2
                  Master_UUID: cad5e075-aef5-11eb-a268-0694ef4b73a5
             Master_Info_File: /data/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0
1 row in set (0.00 sec)
</Code>

3. 在mysql02创建一个数据库

<Code language="shell">
mysql> create database test_async_db02;
Query OK, 1 row affected (0.00 sec)

mysql> use test_async_db02;
Database changed
mysql> create table test2(id int(3),name char(10));
Query OK, 0 rows affected (0.01 sec)

mysql> insert into test2 values (002,'async');
Query OK, 1 row affected (0.00 sec)
</Code>

4. 在mysql01查看是否已同步

<Code language="shell">
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| test               |
| test_async_db      |
| test_async_db02    |
+--------------------+
6 rows in set (0.00 sec)

mysql> use test_async_db02;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed

mysql> select * from test2;
+------+-------+
| id   | name  |
+------+-------+
|    2 | async |
+------+-------+
1 row in set (0.00 sec)
</Code>

#### 5. keepalived配置

1. 安装keepalived

<Code language="shell">
yum install -y openssl-devel
cd /usr/local/src/
wget http://www.keepalived.org/software/keepalived-1.3.5.tar.gz
tar -zvxf keepalived-1.3.5.tar.gz
cd keepalived-1.3.5
./configure --prefix=/usr/local/keepalived
make && make install
     
cp /usr/local/src/keepalived-1.3.5/keepalived/etc/init.d/keepalived /etc/rc.d/init.d/
cp /usr/local/keepalived/etc/sysconfig/keepalived /etc/sysconfig/
mkdir /etc/keepalived/
cp /usr/local/keepalived/etc/keepalived/keepalived.conf /etc/keepalived/
cp /usr/local/keepalived/sbin/keepalived /usr/sbin/
echo "/etc/init.d/keepalived start" >> /etc/rc.local
</Code>



2. 编辑keepalived.conf 

<Code language="shell">
cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bak
vim /etc/keepalived/keepalived.conf
! Configuration File for keepalived

global_defs {
    notification_email {
        xxx@xxx.xx
        xxx@xxx.xx
    }

    notification_email_from xxx@xxx.xx
    smtp_server 127.0.0.1 
    smtp_connect_timeout 30
    router_id xxx //每台机器取名不一样
}

vrrp_script chk_mysql_port {
    script "/opt/chk_mysql.sh"
    interval 2
    weight -5
    fall 2
    rise 1
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    mcast_src_ip x.x.x.x
    virtual_router_id 51
    priority 99
    advert_int 1
    unicast_src_ip x.x.x.x //当前主机ip
    unicast_peer {
      X.X.X.X // 其他主机IP
    }
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        X.X.X.X  // VIP IP
    }
    track_script {
        chk_mysql_port
    }
}
</Code>

3. /opt/chk_mysql.sh脚本内容：如果当前主机mysql宕机，切换到bankup，恢复后自动切换回来

```shell
#!/bin/bash
MYSQL=/usr/local/mysql/bin/mysql
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
CHECK_TIME=3
  
#mysql  is working MYSQL_OK is 1 , mysql down MYSQL_OK is 0
  
MYSQL_OK=1
  
function check_mysql_helth (){
    $MYSQL -h $MYSQL_HOST -u $MYSQL_USER -p${MYSQL_PASSWORD} -e "show status;" >/dev/null 2>&1
    if [ $? = 0 ] ;then
    MYSQL_OK=1
    else
    MYSQL_OK=0
    fi
    return $MYSQL_OK
}
while [ $CHECK_TIME -ne 0 ]
do
    let "CHECK_TIME -= 1"
    check_mysql_helth
if [ $MYSQL_OK = 1 ] ; then
    CHECK_TIME=0
    exit 0
fi
if [ $MYSQL_OK -eq 0 ] &&  [ $CHECK_TIME -eq 0 ]
then
    pkill keepalived
    exit 1
fi
sleep 1
done
```

4. 发生错误处理：

```shell
configure: error: in `/usr/local/src/keepalived-1.3.5':
configure: error: no acceptable C compiler found in $PATH
See `config.log' for more details

yum -y install gcc
```

```
grant all on *.* to root@'ip-xxxx.ap-northeast-1.compute.internal' identified by "";
GRANT ALL PRIVILEGES ON  *.* TO 'superadmin'@'%' IDENTIFIED BY 'admin';
flush privileges;

create user 'superadmin'@'%' identified by 'admin';

UPDATE user SET Password=PASSWORD(‘root’) where USER=‘root’;
```

#### 6. 关于aws ec2之间获取不到keepalived vip地址问题，并且组播不好用：

解决广播模式：

切换KeepAliveD到单播模式，在配置中增加单播机器的IP：

```shell
unicast_src_ip 172.*.*.1 #localIp

unicast_peer {
	172.*.*.124 #Resource-s
}
```



解决获取不到keepalived vip地址问题： 使用ec2的辅助ip地址，在mysql出现问题的时候，由keepalived监视，动态添加辅助IP地址实现，vip漂移。

1. 用 AWS CLI 来实现 VIP 指向的切换

- 3.1.1 如果使用private IP作为 VIP,则：两个服务器配置三个IP 地址，其中一个是 Secondary private IP，它作为内网的VIP使用。这个配置是基础配置。也就是说，如果一个IP指向这台服务器，可是这台服务器上的网卡不认为自己拥有这个IP是不行的。
- 3.2 在两台服务器上安装亚马逊云自己的客户端工具(awscli) 并配置(Authentication，IP 切换时使用）
- 3.3 在KeepAliveD认为自己获取到Master权限的时候，调用awscli命令让Virtual IP实际指向本服务器。这个逻辑是核心逻辑。亚马逊云虽然不允许广播ARP，但可以用命令行指定网卡（ENI）的Secondary-private-ip-address。这个命令的具体形式如下：

<Code language="shell">
--allow-reassignment：因为需要在多台实例切换ip，设置成允许其他实例设置
--network-interface-id：机器网卡id
--private-ip-addresses：需要添加的虚拟地址

aws ec2 assign-private-ip-addresses --allow-reassignment --network-interface-id $ENI --private-ip-addresses $VIP 
</Code>

配置aws cli：

[aws cli 认证方法](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

2. 再次编辑keepalived.conf，加入`notify`时执行的脚本：

```bash
notify   
notify_master 当前状态为master时执行
notify_backup 当前状态为backup时执行
notify_fault  当前状态为fault时执行
```

```shell
cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bak
vim /etc/keepalived/keepalived.conf


! Configuration File for keepalived
       
global_defs {
notification_email {
ops@wangshibo.cn
tech@wangshibo.cn
}
       
notification_email_from ops@wangshibo.cn
smtp_server 127.0.0.1 
smtp_connect_timeout 30
router_id MASTER-HA
}
       
vrrp_script chk_mysql_port {     
    script "/opt/chk_mysql.sh"   
    interval 2                   
    weight -5                    
    fall 2                    
    rise 1                    
}
       
vrrp_instance VI_1 {
    state BACKUP    
    interface eth0      
    mcast_src_ip x.x.x.x
    virtual_router_id 51    
    priority 99          
    advert_int 1
    unicast_src_ip x.x.x.x //当前主机ip 
    unicast_peer { 
      X.X.X.X // 其他主机IP    
    }
    authentication {   
        auth_type PASS 
        auth_pass 1111     
    }
    virtual_ipaddress {    
        X.X.X.X  // VIP IP
    }
    
    notify '/xxx/failover.sh' //
      
  	track_script {               
     		chk_mysql_port             
  	}
}
```

3. 追加状态变化时的检测脚本`failover.sh`

```shell
#!/bin/bash
VIP=x.x.x.x  // 辅助ip地址
ENI=eni  // ec2网卡，每台机器的不一样
LOG=/etc/keepalived/failover.log
TYPE=$1
NAME=$2
STATE=$3
echo -e "\n##### failover to $STATE status ######" >> ${LOG}
date >> ${LOG}
case $STATE in
    "MASTER")
        aws ec2 assign-private-ip-addresses --allow-reassignment --network-interface-id $ENI --private-ip-addresses $VIP 
        ip address add $VIP/24 dev eth0 >> ${LOG} 2>&1
        echo -e "##### complete master script for ${NAME} ######\n" >> ${LOG}
          ;;
    "BACKUP"|"FAULT")
        ip address del $VIP/24 dev eth0 >> ${LOG} 2>&1
        echo -e "#####  complete $STATE script for VRRP ${TYPE} ${NAME} ######\n" >> ${LOG}
          ;;
    *)
        echo "unknown state ${STATE} for VRRP ${TYPE} ${NAME}"
        exit 1
        ;;
esac
```

4. 重启多台机器的keepalived，进行连接测试