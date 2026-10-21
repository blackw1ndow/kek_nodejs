# kek_nodejs
KEK Node.js team

Анатолій Кульчицький ІПЗ-32 (https://github.com/blackw1ndow): Dev
Андрій Перегінць ІПЗ-33 (https://github.com/AndriiPerehinets): Team lead
Олександр Милян ІПЗ-32 (https://github.com/AsterPy): BA
Максим Попович ІПЗ-33 (https://github.com/DecimusMM): Dev
Максим Романюк ІПЗ-33 (https://github.com/kubezen-stack): Dev
Богдан Леонідов ІПЗ-32 (https://github.com/bohdawg): QA
Олександр Купина ІПЗ-32 (https://github.com/SashaKupyna): Dev
Денис Чудла ІПЗ-33 (https://github.com/denyschudla25-netizen): Dev

## Виконана робота (Етап 1)

- Аналіз і планування: вимоги замовника та список відкритих питань, пайплайн роботи на 8 тижнів, ротація ролей (лід / BA / QA), структура проєкту
- Каркас: Express 5 із залежностями, єдина обробка помилок (http-status-codes, errorCodes), Jest з порогом покриття 95%
- База даних: PostgreSQL 16 у Docker, Prisma-схема на 10 таблиць зі зв'язками та унікальними індексами, початкова міграція, seed (адмін, батьки, викладачі, 5 гуртків, ціни)
- Безпека: JWT-автентифікація (30 хв), паролі на bcryptjs, middleware auth / authorize / validate (Zod), ієрархія помилок AppError, ендпоінти POST /auth/login і GET /auth/me
- Бізнес-логіка: вік дитини на 1 вересня, вартість навчання і харчування за місяць і рік зі знижками, зарплати персоналу; усі суми в копійках
- Тестування: 116 unit- та інтеграційних тестів (Jest + Supertest), покриття 100%
- Документація: AUTH.md, DATABASE.md, DOMAIN.md, DOMAIN_AGE_SALARY.md, презентація етапу
