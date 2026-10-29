# Инвентаризация имущества (вариант 3)

Мобильное приложение для iPhone: структура хранения «Комната → Контейнер → Вещь», QR-маркировка контейнеров и сканер QR-кодов.

## Стек

Проект написан на React Native (Expo SDK 58), это альтернатива нативному стеку, разрешённая заданием.

| Требование задания | Реализация |
|---|---|
| SwiftUI | React Native + Expo Router |
| MVVM | Модели (`src/models`), ViewModel-хуки (`src/viewmodels`), экраны (`src/app`) |
| SwiftData (реляционная БД) | SQLite (`expo-sqlite`), `src/data/database.ts` |
| Статический JSON + Decodable | `src/data/propertyTypes.json` + схема Zod |
| URLSession + Combine | Axios + RxJS, `src/data/inventoryApi.ts` |
| Камера | `expo-camera` |

Целевая версия iOS: 26.6 (`expo-build-properties` в `app.json`).

## Обновление до SDK 58

В папке проекта выполните (нужен Node.js 22.13+, 24.3+ или 26):

```bash
npx expo install expo@^58.0.0 --fix
npx expo-doctor@latest
```

Первая команда обновляет `expo` и выравнивает остальные зависимости под SDK 58, вторая проверяет проект. Для запуска в Expo Go на iPhone нужна версия Expo Go с поддержкой SDK 58.

## Запуск

1. Установите на iPhone приложение **Expo Go** из App Store.
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите mock REST API с начальными данными (`server/db.json`):
   ```bash
   npm run api
   ```
4. В другом терминале запустите сервер разработки и отсканируйте QR-код камерой iPhone:
   ```bash
   npx expo start
   ```

iPhone и компьютер должны быть в одной Wi-Fi сети. Приложение обращается к API по адресу компьютера, на котором запущен Metro (порт 3001). Другой адрес можно задать переменной `EXPO_PUBLIC_INVENTORY_URL`, например ссылкой на `server/db.json` в GitHub (raw).

## Структура

- `src/app` — экраны (View): главный экран, карточка контейнера, формы, сканер.
- `src/viewmodels` — ViewModel экранов.
- `src/store` — общее состояние (Zustand) и синхронизация с API.
- `src/data` — база данных, репозиторий, REST API, экспорт, классификатор типов.
- `src/models` — модели данных и формат QR-кода.
- `server` — mock REST API.
