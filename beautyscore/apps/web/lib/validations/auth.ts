import { z } from 'zod'

// Валидация для регистрации
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль слишком длинный')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Пароль должен содержать заглавную букву, строчную букву, цифру и спецсимвол (@$!%*?&)'
    ),
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Необходимо принять условия использования',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

// Валидация для входа
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
})

// Валидация для телефона
export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Номер телефона обязателен')
    .regex(
      /^(\+7|8)[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
      'Введите корректный номер телефона (+7 XXX XXX XX XX)'
    ),
})

// Валидация для SMS кода
export const smsCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Код должен содержать 6 цифр')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
})

// Типы
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PhoneInput = z.infer<typeof phoneSchema>
export type SmsCodeInput = z.infer<typeof smsCodeSchema>
