# LLM Integration Setup

BeautyScore использует LLM для персонализированных рекомендаций с fallback стратегией:
1. **GigaChat** (primary) — Sber AI
2. **YandexGPT** (fallback) — Yandex Cloud

## Получение ключей

### GigaChat API

1. Зарегистрируйтесь на [developers.sber.ru](https://developers.sber.ru)
2. Создайте проект и получите Client Secret
3. Сгенерируйте Base64 Authorization key: `base64(client_id:client_secret)`

### YandexGPT API

1. Создайте аккаунт в [Yandex Cloud](https://cloud.yandex.ru)
2. Создайте сервисный аккаунт с ролью `ai.languageModels.user`
3. Получите IAM token или API key
4. Запишите Folder ID каталога

## Переменные окружения

Добавьте в `.env`:

```env
# GigaChat (Sber AI)
# Base64 encoded: base64(client_id:client_secret)
GIGACHAT_API_KEY=your_base64_encoded_credentials

# YandexGPT (Yandex Cloud)
# IAM token or API key
YANDEX_GPT_API_KEY=your_iam_token_or_api_key
YANDEX_FOLDER_ID=your_folder_id
```

## Режим без LLM

Если ключи не настроены, приложение работает в fallback режиме:
- Персональные оценки недоступны
- Показывается общая информация о продуктах
- Пользователь видит сообщение о временной недоступности

## Тестирование

```bash
# Проверить доступность GigaChat
curl -X POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth \
  -H "Authorization: Basic $GIGACHAT_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "scope=GIGACHAT_API_PERS"

# Проверить доступность YandexGPT
curl -X POST https://llm.api.cloud.yandex.net/foundationModels/v1/completion \
  -H "Authorization: Bearer $YANDEX_GPT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"modelUri":"gpt://'$YANDEX_FOLDER_ID'/yandexgpt-lite","completionOptions":{"maxTokens":"100"},"messages":[{"role":"user","text":"Привет"}]}'
```

## Кеширование

LLM ответы кешируются на 24 часа:
- Ключ кеша: `llm:{type}:{itemId}:{promptHash}`
- TTL: 86400 секунд (24 часа)
- Инвалидация: при изменении профиля пользователя

## Rate Limits (по PRD)

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/search/ask` | 10 req | 1 min |
| `/api/profile/regenerate-prompt` | 5 req | 1 min |

## Модели

### GigaChat
- `GigaChat` — базовая модель
- `GigaChat-Pro` — улучшенная модель (требует B2B доступ)

### YandexGPT  
- `yandexgpt-lite` — быстрая модель
- `yandexgpt` — полная модель
