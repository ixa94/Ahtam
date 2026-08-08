# Чистая переустановка и защищённый деплой АХТАМ

## Почему нужен именно новый образ

На старом сервере подтверждена root-компрометация:

- `/etc/rondo/rondo` — посторонний статический ELF-файл, SHA-256 `9bac96ef5249488263458bd100f6a0ad7e8e597f0b35ef5cb0348456362fe9fa`;
- он запускается через `/etc/crontab`, `/etc/cron.d/rondo`, `/etc/init.d/rondo` и root-crontab;
- процесс майнера замаскирован как `/bin/softirq` и использует RandomX;
- `/usr/bin/ss`, `/usr/bin/systemctl`, `top`, `lsof` и другие утилиты отключены правами `000`;
- рядом с приложением `data.sqlite`, `let` и `lrt` являются ELF-бинарниками, а не данными;
- 8 августа 2026 года были посторонние root-входы с IP `185.211.6.53`.

Не восстанавливайте снэпшот заражённого диска и не переносите с него `node_modules`, `.next`, домашние каталоги, системные конфиги или весь `/var/www`. Если нужны старые заявки, переносите только вручную проверенные `data/*.json`; безопаснее начать без них.

## 1. До переустановки

Все секреты из старого серверного `.env` считаются украденными. До запуска нового сайта замените:

- `ADMIN_PASSWORD`;
- пароль приложения SMTP/почты;
- токены Telegram и MAX;
- Supabase service-role key, если он использовался;
- старый SSH-ключ сервера и GitHub deploy key;
- пароль root, опубликованный в переписке.

Не загружайте на новый сервер старый серверный `.env`. Отредактируйте локальный `.env`, подставив уже перевыпущенные значения.

Создайте отдельный ключ для нового сервера в PowerShell на своём компьютере:

```powershell
ssh-keygen -t ed25519 -a 100 -f "$env:USERPROFILE\.ssh\akhtam_reg_2026" -C "akhtam-reg-2026"
Get-Content "$env:USERPROFILE\.ssh\akhtam_reg_2026.pub"
```

В REG.RU откройте сервер → **Ещё** → **Переустановить образ**, выберите чистую Ubuntu 24.04 LTS и добавьте этот публичный SSH-ключ. Не выбирайте восстановление из копии или снэпшота заражённого диска.

## 2. Первый вход и базовая настройка

Сразу после переустановки подключитесь по стандартному порту:

```powershell
ssh -i "$env:USERPROFILE\.ssh\akhtam_reg_2026" root@80.78.246.7
```

На сервере выполните:

```bash
apt update
DEBIAN_FRONTEND=noninteractive apt full-upgrade -y
apt install -y ca-certificates curl git jq nginx ufw fail2ban unattended-upgrades xz-utils certbot python3-certbot-nginx

adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
install -m 600 -o deploy -g deploy /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
passwd deploy
```

Пароль `deploy` задайте интерактивно, уникальный и длинный. SSH-вход по паролю ниже будет отключён; пароль останется только для `sudo` через консоль.

Для сервера с 1 ГБ RAM добавьте swap, чтобы сборка Next.js не падала по памяти:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
printf '/swapfile none swap sw 0 0\n' >> /etc/fstab
```

## 3. Новый SSH-порт и запрет root/password-входа

Сначала временно оставьте оба порта, чтобы не потерять доступ:

```bash
cat >/etc/ssh/sshd_config.d/99-akhtam-hardening.conf <<'EOF'
Port 22
Port 48222
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
AllowUsers deploy
EOF

sshd -t
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw limit 48222/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
systemctl reload ssh
```

Не закрывая текущую сессию, проверьте вход во втором окне PowerShell:

```powershell
ssh -i "$env:USERPROFILE\.ssh\akhtam_reg_2026" -p 48222 deploy@80.78.246.7
```

Только после успешного входа оставьте один новый порт:

```bash
sudo sed -i '/^Port 22$/d' /etc/ssh/sshd_config.d/99-akhtam-hardening.conf
sudo sshd -t
sudo systemctl reload ssh
sudo ufw delete allow 22/tcp
sudo passwd -l root
```

Настройте Fail2ban:

```bash
sudo tee /etc/fail2ban/jail.d/sshd.local >/dev/null <<'EOF'
[sshd]
enabled = true
port = 48222
maxretry = 4
findtime = 10m
bantime = 24h
EOF

sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

Нестандартный порт уменьшает шум сканеров, но основную защиту дают ключи и отключённые root/password-входы.

## 4. Node.js 24 LTS и PM2

Установите проверенный официальный бинарный архив Node.js 24 LTS:

```bash
cd /tmp
mkdir node-install
cd node-install
NODE_VERSION=v24.18.0
curl -fsSLO "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz"
curl -fsSLO "https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt"
grep " node-${NODE_VERSION}-linux-x64.tar.xz$" SHASUMS256.txt | sha256sum -c -
sudo tar -xJf "node-${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1
node --version
npm --version
sudo npm install -g pm2@latest
pm2 --version
```

## 5. Доступ GitHub и клонирование проекта

Создайте отдельный read-only deploy key от пользователя `deploy`:

```bash
sudo -iu deploy
ssh-keygen -t ed25519 -a 100 -f ~/.ssh/github_akhtam -C "akhtam-production"
cat ~/.ssh/github_akhtam.pub
```

Добавьте показанный публичный ключ в GitHub: репозиторий `ixa94/Ahtam` → **Settings** → **Deploy keys** → **Add deploy key**. Не включайте право записи.

Затем на сервере под пользователем `deploy`:

```bash
cat >~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_akhtam
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh-keyscan -H github.com >> ~/.ssh/known_hosts
chmod 600 ~/.ssh/known_hosts
exit

sudo install -d -o deploy -g deploy /var/www/akhtam
sudo -iu deploy git clone --branch main git@github.com:ixa94/Ahtam.git /var/www/akhtam
```

## 6. Перенос локального `.env`

На локальном компьютере, из корня проекта, отправьте обновлённый локальный файл. Его содержимое не выводится в терминал:

```powershell
scp -i "$env:USERPROFILE\.ssh\akhtam_reg_2026" -P 48222 .env deploy@80.78.246.7:/home/deploy/akhtam.env
ssh -i "$env:USERPROFILE\.ssh\akhtam_reg_2026" -p 48222 deploy@80.78.246.7 "install -m 600 /home/deploy/akhtam.env /var/www/akhtam/.env.production.local && rm -f /home/deploy/akhtam.env"
```

Проверьте только имена переменных, не печатая значения:

```bash
cd /var/www/akhtam
sed -n 's/^\([A-Z0-9_]*\)=.*/\1/p' .env.production.local
stat -c '%a %U:%G %n' .env.production.local
```

Ожидаемые переменные перечислены в `.env.example`. `ADMIN_PASSWORD` должен быть не короче 16 символов, рекомендуется 32+.

## 7. Первая сборка и запуск

```bash
sudo -iu deploy
cd /var/www/akhtam
npm ci
npm audit --omit=dev
npm run typecheck
npm run lint
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Последняя команда напечатает одну команду с `sudo`. Выполните именно её, затем ещё раз:

```bash
pm2 save
pm2 status
curl -I http://127.0.0.1:3000/
exit
```

## 8. Nginx и HTTPS

Создайте конфигурацию:

```bash
sudo tee /etc/nginx/sites-available/akhtam >/dev/null <<'EOF'
limit_req_zone $binary_remote_addr zone=akhtam_leads:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=akhtam_login:10m rate=5r/m;

server {
    listen 80;
    listen [::]:80;
    server_name ahtambanket.ru www.ahtambanket.ru;

    client_max_body_size 1m;

    location = /api/leads {
        limit_req zone=akhtam_leads burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /api/admin/session {
        limit_req zone=akhtam_login burst=3 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/akhtam /etc/nginx/sites-enabled/akhtam
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Когда DNS домена указывает на `80.78.246.7`, выпустите сертификат:

```bash
sudo certbot --nginx -d ahtambanket.ru -d www.ahtambanket.ru --redirect
sudo certbot renew --dry-run
```

## 9. Проверка работоспособности

```bash
pm2 status
pm2 logs akhtam --lines 100 --nostream
curl -fsS http://127.0.0.1:3000/ >/dev/null && echo LOCAL_OK
curl -fsS https://ahtambanket.ru/ >/dev/null && echo HTTPS_OK
curl -fsS https://ahtambanket.ru/api/blocked-dates | jq .
sudo nginx -t
sudo ss -lntup
sudo ufw status verbose
sudo fail2ban-client status sshd
systemctl --failed
```

Снаружи должны быть доступны только `80`, `443` и `48222`. Порт `3000` должен слушать только `127.0.0.1`.

## 10. Последующие обновления

После того как изменения отправлены в ветку `main`, обновление выполняется от пользователя `deploy`:

```bash
cd /var/www/akhtam
bash scripts/deploy.sh
```

Скрипт делает `git pull --ff-only`, чистую установку из lock-файла, аудит production-зависимостей, проверку типов, линтер, production-сборку, безопасный перезапуск PM2 и локальный health-check. Если любой этап падает, новая версия не перезапускает работающий процесс.
