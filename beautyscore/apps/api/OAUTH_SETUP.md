# Настройка OAuth авторизации для BeautyScore

Данная инструкция описывает настройку OAuth провайдеров (VK ID, Yandex ID, Telegram) для BeautyScore.

> 📌 **Примечание для разработки**: Большинство современных OAuth провайдеров (включая VK ID) требуют HTTPS даже для разработки. Для локальной разработки рекомендуется использовать [ngrok](https://ngrok.com/) для создания HTTPS туннеля к вашему локальному серверу.

## Переменные окружения

Добавьте следующие переменные в файл `.env` в директории `beautyscore/apps/api`:

```env
# VK ID SDK (получено из https://id.vk.com/about/business/go)
VK_APP_ID=54424556
VK_APP_SECRET=zyyK0gF91eDW42AcWmHg
VK_SERVICE_KEY=029639b3029639b3029639b36601a84a5f00296029639b36bfdbea651f19d3b46f58e33

# Yandex ID (https://oauth.yandex.ru/)
YANDEX_CLIENT_ID=6021072f0df3442786032804c46fe2f4
YANDEX_CLIENT_SECRET=e2800e2f452d44ff9efb8c5ffa95154b
YANDEX_CALLBACK_URL=http://localhost:3001/api/auth/yandex/callback

# Telegram (@BotFather)
TELEGRAM_BOT_TOKEN=8277716371:AAGkXSDc0kVYKuOqUOsUsIryr_1avqcpUZw
TELEGRAM_BOT_USERNAME=beautydsoifmsdklbot

# Frontend и API URLs
FRONTEND_URL=https://localhost:3000
CORS_ORIGIN=https://localhost:3000
API_URL=http://localhost:3001
```

---

## 1. VK ID (ВКонтакте) - SDK интеграция

> 📦 **Мы используем VK ID SDK** - современный способ интеграции, рекомендованный VK. SDK рендерит кнопку авторизации и обрабатывает токены на фронтенде.

### Ваши данные приложения:
- **ID приложения**: `54424556`
- **Защищённый ключ**: `zyyK0gF91eDW42AcWmHg`
- **Базовый домен**: `localhost`
- **Redirect URL**: `https://localhost:3000/` (локальный HTTPS с mkcert)

### Как работает VK ID SDK:

1. **На фронтенде** загружается VK ID SDK
2. SDK рендерит кнопку "Войти с VK ID"
3. После авторизации SDK возвращает `code` и `device_id`
4. Код обменивается на токены через `VKID.Auth.exchangeCode()`
5. Токены отправляются на наш бэкенд для создания сессии

### ✨ Важно для разработки:

**VK ID требует HTTPS даже для localhost!**

- ⚠️ VK ID больше не принимает `http://localhost` - требуется HTTPS
- ✅ Используйте Cloudflare Tunnel для создания HTTPS туннеля
- ✅ Текущий туннель: `https://elder-judy-reno-eagle.trycloudflare.com`

### Настройка VK приложения:

1. Перейдите в [Сервис авторизации VK ID](https://id.vk.com/about/business/go)
2. Создайте приложение или откройте существующее (ID: 54424556)
3. **Запустите Cloudflare Tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```
4. В настройках VK ID укажите:
   - **Базовый домен**: `localhost`
   - **Доверенный Redirect URL**: `https://elder-judy-reno-eagle.trycloudflare.com/`

### Обновите `.env` файл:

```env
# VK ID SDK (для бэкенда - получение профиля)
VK_APP_ID=54424556
VK_APP_SECRET=zyyK0gF91eDW42AcWmHg
VK_SERVICE_KEY=029639b3029639b3029639b36601a84a5f00296029639b36bfdbea651f19d3b46f58e33
```

### Важные примечания:
- **Redirect URL в SDK** настроен на `http://localhost:3000/` (фронтенд)
- **VK ID SDK работает через CORS** - туннель не требуется для разработки
- **Для продакшна** укажите реальный домен с HTTPS
- Redirect URL должен быть зарегистрирован в настройках VK ID приложения
  
### Документация VK ID:
- [Создание приложения](https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/create-application)
- [VK ID SDK для Web](https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/web/sdk)

---

## 2. Yandex ID (Яндекс OAuth)

### 📋 Шаги настройки:

#### 1️⃣ Создайте приложение в Яндекс OAuth

1. Откройте [Яндекс OAuth](https://oauth.yandex.ru/)
2. Войдите в свой аккаунт Яндекса
3. Нажмите **"Зарегистрировать новое приложение"**
4. Заполните форму:
   - **Название**: `BeautyScore`
   - **Описание**: Платформа для анализа косметики с помощью ИИ
   - **Платформы**: 
     - ✅ **Веб-сервисы** (обязательно)
     - Можете добавить мобильные платформы для будущего

#### 2️⃣ Настройте доступы (Permissions)

В разделе **"Данные"** выберите:
- ✅ **Яндекс.Паспорт** → `login:email` (Доступ к email адресу)
- ✅ **Яндекс.Паспорт** → `login:info` (Доступ к имени, фамилии, полу)
- ✅ **Яндекс.Паспорт** → `login:avatar` (Доступ к аватару пользователя)

#### 3️⃣ Добавьте Redirect URI (Callback URL)

В поле **"Redirect URI"** добавьте:

**Для разработки:**
```
http://localhost:3001/api/auth/yandex/callback
```

**Для продакшна (позже):**
```
https://yourdomain.com/api/auth/yandex/callback
```

> ⚠️ **Важно**: Яндекс OAuth поддерживает HTTP для localhost, но требует HTTPS для продакшна.

#### 4️⃣ Получите учетные данные

После создания приложения, на странице настроек скопируйте:
- **ID** (Client ID) → сохраните как `YANDEX_CLIENT_ID`
- **Пароль** (Client Secret) → нажмите "Показать" и сохраните как `YANDEX_CLIENT_SECRET`

#### 5️⃣ Добавьте в .env файл

Откройте `beautyscore/apps/api/.env` и добавьте:

```env
# Yandex ID
YANDEX_CLIENT_ID=your_client_id_here
YANDEX_CLIENT_SECRET=your_client_secret_here
YANDEX_CALLBACK_URL=http://localhost:3001/api/auth/yandex/callback
```

---

### ✅ Готово! Яндекс OAuth настроен!

После перезапуска бэкенда, кнопка "Войти через Яндекс ID" будет работать.

**Что произойдет при входе:**
1. Пользователь кликает кнопку → редирект на Яндекс
2. Пользователь авторизуется в Яндексе
3. Яндекс возвращает на `/api/auth/yandex/callback` с кодом
4. Бэкенд получает профиль (email, имя, аватар)
5. Создает или находит пользователя по `yandexId`
6. Генерирует JWT токены
7. Редиректит на `/app` или `/onboarding`

---

### 🔧 Продакшн настройки:
- Замените HTTP на HTTPS в Redirect URI
- Добавьте продакшн домен в настройках Яндекс OAuth
- Обновите `YANDEX_CALLBACK_URL` в env переменных

---

## 3. Telegram Login Widget

### Шаги настройки:

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например, "BeautyScore Auth")
   - Введите username бота (например, `beautyscore_auth_bot`)
4. Скопируйте **токен бота** → `TELEGRAM_BOT_TOKEN`

5. Настройте домен для Login Widget:
   - Отправьте `/setdomain` команду BotFather
   - Выберите вашего бота
   - Введите домен: `localhost` (для разработки) или ваш продакшн домен

### Интеграция на фронтенде:

Telegram Login Widget должен быть добавлен на страницу авторизации. Добавьте следующий скрипт:

```html
<script async src="https://telegram.org/js/telegram-widget.js?22" 
        data-telegram-login="YOUR_BOT_USERNAME" 
        data-size="large" 
        data-auth-url="http://localhost:3001/api/auth/telegram"
        data-request-access="write">
</script>
```

Либо используйте React-компонент для интеграции.

### Важно:
- Telegram требует HTTPS для продакшна
- Локально работает только через настроенный домен

---

## 4. SMS авторизация (опционально)

Для SMS верификации добавьте:

```env
# SMS Provider (sms.ru, smsc.ru, или mock)
SMS_PROVIDER=mock
SMS_MOCK_MODE=true

# Для реального провайдера:
# SMS_API_KEY=your_sms_api_key
# SMS_SENDER_NAME=BeautyScore
```

### Поддерживаемые провайдеры:
- **SMS.RU**: [sms.ru](https://sms.ru/)
- **SMSC.RU**: [smsc.ru](https://smsc.ru/)

В режиме `SMS_MOCK_MODE=true` коды выводятся в консоль бэкенда.

---

## Проверка настройки

После настройки переменных окружения:

1. Перезапустите бэкенд:
   ```bash
   cd beautyscore/apps/api
   npm run start:dev
   ```

2. Проверьте эндпоинты:
   - VK: `http://localhost:3001/api/auth/vk`
   - Yandex: `http://localhost:3001/api/auth/yandex`
   - SMS: `POST http://localhost:3001/api/auth/sms/send`

3. Откройте фронтенд и протестируйте авторизацию через разные провайдеры.

---

## Устранение проблем

### "Not allowed by CORS"
Убедитесь, что `CORS_ORIGIN` в `.env` бэкенда соответствует URL фронтенда.

### "Invalid redirect_uri"
Проверьте, что Callback URL в настройках OAuth провайдера точно совпадает с переменной окружения.

### Telegram: "Bot domain invalid"
Настройте домен через BotFather командой `/setdomain`.

---

## Безопасность

⚠️ **Никогда не коммитьте файл `.env` в репозиторий!**

Для продакшна:
- Используйте переменные окружения сервера
- Храните секреты в безопасном хранилище (Vault, AWS Secrets Manager и т.д.)
- Ограничьте доступ к OAuth секретам
