// Russian translations for HeroLift
export const t = {
  // App name
  appName: 'HeroLift',

  // Navigation
  nav: {
    home: 'Главная',
    history: 'История',
    analytics: 'Аналитика',
    records: 'Рекорды',
    settings: 'Настройки',
  },

  // Home page
  home: {
    lastWorkout: 'Последняя тренировка',
    date: 'Дата',
    bestSet: 'Лучший подход',
    setCount: 'Количество подходов',
    feeling: 'Самочувствие',
    bestDay: 'Лучший день',
    avgWeight: 'Средний рабочий вес',
    totalTonnage: 'Общий тоннаж',
    week: 'Неделя',
    month: 'Месяц',
    noWorkouts: 'Нет тренировок',
    excellent: 'Отлично',
    good: 'Хорошо',
    normal: 'Нормально',
    hard: 'Очень тяжело',
  },

  // Workout editor
  editor: {
    addWorkout: 'Добавить тренировку',
    editWorkout: 'Редактировать тренировку',
    date: 'Дата',
    sets: 'Подходы',
    weight: 'Вес',
    reps: 'Повторения',
    addSet: 'Добавить подход',
    removeSet: 'Удалить подход',
    feeling: 'Самочувствие',
    excellent: 'Отлично',
    good: 'Хорошо',
    normal: 'Нормально',
    hard: 'Очень тяжело',
    notes: 'Заметки',
    tags: 'Теги',
    technique: 'Техника',
    unload: 'Разгрузка',
    strength: 'Силовая',
    easy: 'Легкая',
    save: 'Сохранить тренировку',
    cancel: 'Отмена',
    validation: {
      dateRequired: 'Укажите дату',
      minSets: 'Добавьте минимум один подход',
    },
  },

  // History
  history: {
    title: 'История',
    bestSet: 'Лучший подход',
    setCount: 'Количество подходов',
    allSets: 'Все подходы',
    tonnage: 'Тоннаж',
    avgWeight: 'Средний вес',
    avgReps: 'Средние повторения',
    feeling: 'Самочувствие',
    tags: 'Теги',
    notes: 'Заметки',
    edit: 'Редактировать',
    delete: 'Удалить',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    deleteConfirm: 'Удалить эту тренировку?',
    noWorkouts: 'Нет тренировок',
  },

  // Analytics
  analytics: {
    title: 'Аналитика',
    week: 'Неделя',
    month: 'Месяц',
    avgWeight: 'Средний вес',
    workoutCount: 'Количество тренировок',
    totalTonnage: 'Общий тоннаж',
    weightStats: 'Статистика веса',
    avgReps: 'Среднее количество повторений',
    maxWeight: 'График рабочего веса',
    filteredMetrics: 'Выбранные метрики:',
  },

  // Records
  records: {
    title: 'Рекорды',
    personalBest: 'Личный рекорд',
    bestDayMonth: 'Лучший день месяца',
    maxTonnage: 'Максимальный тоннаж',
    bestTrainDay: 'Лучший тренировочный день',
    totalWorkouts: 'Количество тренировок',
  },

  // Settings
  settings: {
    title: 'Настройки',
    exportPNG: 'Экспорт PNG',
    clearData: 'Очистить все данные',
    clearConfirm: 'Удалить все данные?',
    deleteConfirm: 'Подтвердить',
    cancel: 'Отмена',
    about: 'О приложении',
    version: 'Версия 1.0.0',
  },

  // Recommendations
  recommendations: {
    increaseWeight: 'Можно увеличить рабочий вес на {{amount}} кг.',
    unloadSession: 'Стоит сделать разгрузочную тренировку.',
    addSet: 'Добавьте один дополнительный подход.',
    focusTechnique: 'Уделите внимание технике.',
    drinkWater: 'Пейте больше воды.',
    increaseRest: 'Увеличьте отдых между подходами.',
    excellentProgress: 'Прогресс отличный.',
  },

  // Common
  common: {
    lbs: 'кг',
    reps: 'раз',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
  },
};

// Feeling emojis
export const feelingEmojis = {
  excellent: '😀',
  good: '🙂',
  normal: '😐',
  hard: '😫',
};

// Feeling values
export const feelingValues = {
  excellent: 'excellent',
  good: 'good',
  normal: 'normal',
  hard: 'hard',
};
