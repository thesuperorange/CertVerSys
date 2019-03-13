step1. 先把 Nginx 安裝起來

    $ yum install nginx

step2. nginx.conf 常態性調整

    $ vim /etc/nginx/nginx.conf
    user              nginx;
    worker_processes  2;
    worker_cpu_affinity 01 10;
    events {
        use epoll;
        worker_connections  1024;
    }

step3. 設定 Reverse Proxy

    server {
        listen 443 default_server ssl;
        listen [::]:443 default_server ssl;
        server_name  certproof.nchc.org.tw;
        root         /usr/share/nginx/html;
        index index.html index.htm

        ssl on;

        ssl_certificate /etc/ssl/certs/nginx-ssl.crt;
        ssl_certificate_key /etc/ssl/certs/nginx-ssl-nopwd.key;

        #ssl_stapling on;
        ssl_stapling_verify on;
        #ssl_certificate /etc/ssl/certs/nginx-ssl.crt;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        location / {
        }

        error_page 404 /404.html;
            location = /40x.html {
        }
        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }


step4. 啟動 nginx

    service nginx restart

step5. 檢查 nginx 是否有錯誤訊息

    nginx -t 
    systemctl status nginx.service
    
step6. 編譯 pem to crt and key

    cp pem to crt and chmod 777 to crt file
    openssl rsa -in filename.pem -out filename.key
    //key transfer to no password
    openssl rsa -in server.key -out server_no_pwd.key
    
step7. 重新啟動 nginx
    
    service nginx restart
    
    
** 靜態網頁如help.html要放在 https://certproof.nchc.org.tw/help.html

修改 config檔裡的 index.js檔案中 參數 build: assetsPublicPath: '', 為 ''

執行 npm run build 產生 dist 目錄後，將 該目錄 放於 root 的路徑下，例如： 
/usr/share/nginx/html/ 下 即可

其他：
https://router.vuejs.org/zh-cn/essentials/history-mode.html

設定 mode: 'history' ， 可去除網址列的 # 字號

yum -y install wget
https://blog.csdn.net/boolbo/article/details/72580104

-A RH-Firewall-1-INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT

service iptables save

service iptables restart