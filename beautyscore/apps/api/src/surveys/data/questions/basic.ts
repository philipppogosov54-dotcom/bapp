/**
 * Basic Survey Questions (5 questions)
 * Required for initial personalization
 */

export interface SurveyQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'single' | 'multiple' | 'text' | 'date' | 'scale';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export const basicQuestions: SurveyQuestion[] = [
  {
    id: 'gender',
    question: 'Укажите ваш пол',
    type: 'single',
    options: [
      { value: 'MALE', label: 'Мужской' },
      { value: 'FEMALE', label: 'Женский' },
      { value: 'OTHER', label: 'Другой' },
      { value: 'PREFER_NOT_TO_SAY', label: 'Предпочитаю не отвечать' },
    ],
    required: true,
  },
  {
    id: 'age_range',
    question: 'Ваш возраст',
    type: 'single',
    options: [
      { value: '18-24', label: '18-24 года' },
      { value: '25-34', label: '25-34 года' },
      { value: '35-44', label: '35-44 года' },
      { value: '45-54', label: '45-54 года' },
      { value: '55+', label: '55+ лет' },
    ],
    required: true,
  },
  {
    id: 'skin_type',
    question: 'Какой у вас тип кожи?',
    description: 'Выберите тип, который лучше всего описывает вашу кожу',
    type: 'single',
    options: [
      { value: 'DRY', label: 'Сухая', description: 'Ощущение стянутости, шелушение' },
      { value: 'OILY', label: 'Жирная', description: 'Блеск, расширенные поры' },
      { value: 'COMBINATION', label: 'Комбинированная', description: 'Жирная T-зона, сухие щёки' },
      { value: 'NORMAL', label: 'Нормальная', description: 'Без явных проблем' },
      { value: 'SENSITIVE', label: 'Чувствительная', description: 'Легко краснеет, реагирует на косметику' },
    ],
    required: true,
  },
  {
    id: 'main_concerns',
    question: 'Какие проблемы кожи вас беспокоят?',
    description: 'Выберите до 5 наиболее актуальных',
    type: 'multiple',
    options: [
      { value: 'acne', label: 'Акне, высыпания' },
      { value: 'pigmentation', label: 'Пигментация, неровный тон' },
      { value: 'wrinkles', label: 'Морщины, возрастные изменения' },
      { value: 'dryness', label: 'Сухость, обезвоженность' },
      { value: 'oiliness', label: 'Жирный блеск' },
      { value: 'pores', label: 'Расширенные поры' },
      { value: 'redness', label: 'Покраснения, раздражения' },
      { value: 'dark_circles', label: 'Тёмные круги под глазами' },
      { value: 'none', label: 'Нет особых проблем' },
    ],
    required: true,
    validation: { max: 5 },
  },
  {
    id: 'skincare_goal',
    question: 'Какая ваша главная цель ухода?',
    type: 'single',
    options: [
      { value: 'hydration', label: 'Увлажнение' },
      { value: 'anti_aging', label: 'Антивозрастной уход' },
      { value: 'acne_treatment', label: 'Лечение акне' },
      { value: 'brightening', label: 'Выравнивание тона' },
      { value: 'oil_control', label: 'Контроль жирности' },
      { value: 'protection', label: 'Защита кожи' },
      { value: 'general', label: 'Общий уход' },
    ],
    required: true,
  },
];

export const BASIC_SURVEY_VERSION = '1.0';
