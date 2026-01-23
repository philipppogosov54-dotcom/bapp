# ⚡ Quick Start: Яндекс OAuth Setup

## 📋 Что нужно сделать:

### 1️⃣ Создайте приложение в Яндекс OAuth

1. Откройте: https://oauth.yandex.ru/
2. Войдите в Яндекс аккаунт
3. Нажмите **"Зарегистрировать новое приложение"**

**Форма создания:**
```
Название: BeautyScore
Описание: AI-платформа для анализа косметики
Платформы: ✅ Веб-сервисы
```

### 2️⃣ Настройте доступы

В разделе **"Данные"** выберите:
- ✅ `login:email` - Доступ к email адресу
- ✅ `login:info` - Имя, фамилия, пол
- ✅ `login:avatar` - Аватар пользователя

### 3️⃣ Добавьте Redirect URI

В поле **"Redirect URI"**:
```
http://localhost:3001/api/auth/yandex/callback
```

### 4️⃣ Скопируйте учетные данные

После создания приложения:
- **ID** (Client ID) - скопируйте
- **Пароль** (Client Secret) - нажмите "Показать" и скопируйте

### 5️⃣ Добавьте в .env

Откройте файл: `beautyscore/apps/api/.env`

Добавьте строки:
```env
YANDEX_CLIENT_ID=ваш_client_id_тут
YANDEX_CLIENT_SECRET=ваш_client_secret_тут
YANDEX_CALLBACK_URL=http://localhost:3001/api/auth/yandex/callback
```

### 6️⃣ Перезапустите бэкенд

Остановите (Ctrl+C) и запустите:
```bash
cd /Users/iprofi/projects/beauty_v1_real/beautyscore/apps/api
npm run start:dev
```

---

## ✅ Готово!

Теперь кнопка **"Войти через Яндекс ID"** будет работать!

**Проверка:**
1. Откройте https://localhost:3000/login
2. Кликните "Войти через Яндекс ID"
3. Авторизуйтесь в Яндексе
4. Вас вернет на BeautyScore с созданным аккаунтом

**Данные сохранятся в базу:**
- ✅ `yandexId` - ID пользователя Яндекс
- ✅ `email` - Email из Яндекс аккаунта
- ✅ `name` - Имя и фамилия
- ✅ `avatar` - URL аватара
- ✅ `emailVerified` - Дата верификации
- ✅ `lastLoginAt` - Время входа
- ✅ `lastLoginIp` - IP адрес

---

## 📚 Полная документация

Смотрите `beautyscore/apps/api/OAUTH_SETUP.md` для полной инструкции.
