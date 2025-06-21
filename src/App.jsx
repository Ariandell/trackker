import React, { useState, useEffect, useMemo } from 'react';
// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDijuTU-_zP2pNOBoDjAoL-9yEcYReYqUQ",
  authDomain: "learning-tracker-app-8ff90.firebaseapp.com",
  projectId: "learning-tracker-app-8ff90",
  storageBucket: "learning-tracker-app-8ff90.firebasestorage.app",
  messagingSenderId: "445708069263",
  appId: "1:445708069263:web:d723a7a4fcfbcd2535c3fa",
  measurementId: "G-L4R2T1QDWP"
};

// Іконки для інтерфейсу (SVG)
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const FireIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5Z"></path>
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);

const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// Початкові дані для навчального плану
const initialPlanData = [
    {
        id: 'js',
        title: 'JavaScript (ES6+)',
        totalDays: 35,
        topics: [
            { day: 1, theme: 'Змінні та типи даних', whatToLearn: 'let, const, var, примітивні типи', practice: 'Написати 10 прикладів з різними типами', completedBy: [], comments: {} },
            { day: 2, theme: 'Оператори', whatToLearn: 'Арифметичні, порівняння, логічні, тернарний', practice: 'Калькулятор на операторах', completedBy: [], comments: {} },
            { day: 3, theme: 'Умовні конструкції', whatToLearn: 'if/else, switch, short-circuit', practice: 'Гра "Вгадай число"', completedBy: [], comments: {} },
            { day: 4, theme: 'Цикли', whatToLearn: 'for, while, do-while', practice: 'Таблиця множення, фібоначчі', completedBy: [], comments: {} },
            { day: 5, theme: 'Цикли 2.0', whatToLearn: 'for...in, for...of, break/continue', practice: 'Обхід об\'єктів та масивів', completedBy: [], comments: {} },
            { day: 6, theme: 'Функції', whatToLearn: 'Declaration, expression, параметри, return', practice: '20 функцій різного типу', completedBy: [], comments: {} },
            { day: 7, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'Консольна гра "Камінь-ножиці-папір"', completedBy: [], comments: {} },
            { day: 8, theme: 'Arrow functions', whatToLearn: 'Синтаксис, особливості this', practice: 'Переписати попередні функції', completedBy: [], comments: {} },
            { day: 9, theme: 'Destructuring', whatToLearn: 'Об\'єкти та масиви, вкладені структури', practice: 'Парсинг складних об\'єктів', completedBy: [], comments: {} },
            { day: 10, theme: 'Spread/Rest', whatToLearn: '...args, копіювання, злиття', practice: 'Функції з довільною к-стю параметрів', completedBy: [], comments: {} },
            { day: 11, theme: 'Template literals', whatToLearn: 'Багаторядкові строки, інтерполяція', practice: 'HTML генератор', completedBy: [], comments: {} },
            { day: 12, theme: 'Default parameters', whatToLearn: 'Значення за замовчуванням, патерни', practice: 'Конфігуруємі функції', completedBy: [], comments: {} },
            { day: 13, theme: 'Модулі', whatToLearn: 'import/export, named vs default', practice: 'Розбити проект на модулі', completedBy: [], comments: {} },
            { day: 14, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'TODO список з модулями', completedBy: [], comments: {} },
            { day: 15, theme: 'Масиви: основи', whatToLearn: 'push, pop, shift, unshift, splice', practice: 'Черга та стек', completedBy: [], comments: {} },
            { day: 16, theme: 'Масиви: перебір', whatToLearn: 'map, filter, reduce', practice: 'Обробка списку товарів', completedBy: [], comments: {} },
            { day: 17, theme: 'Масиви: пошук', whatToLearn: 'find, findIndex, some, every', practice: 'Фільтр користувачів', completedBy: [], comments: {} },
            { day: 18, theme: 'Об\'єкти', whatToLearn: 'Object.keys, values, entries, assign', practice: 'Злиття конфігів', completedBy: [], comments: {} },
            { day: 19, theme: 'Strings', whatToLearn: 'split, join, slice, replace, RegExp основи', practice: 'Текстовий редактор', completedBy: [], comments: {} },
            { day: 20, theme: 'Number/Math/Date', whatToLearn: 'Округлення, random, робота з датами', practice: 'Календар подій', completedBy: [], comments: {} },
            { day: 21, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'Аналітика даних (середнє, мін/макс)', completedBy: [], comments: {} },
            { day: 22, theme: 'Callbacks', whatToLearn: 'Поняття, setTimeout, callback hell', practice: 'Послідовні анімації', completedBy: [], comments: {} },
            { day: 23, theme: 'Promises', whatToLearn: 'Створення, then/catch/finally', practice: 'Ланцюжок промісів', completedBy: [], comments: {} },
            { day: 24, theme: 'Promise методи', whatToLearn: 'Promise.all, race, allSettled', practice: 'Паралельні запити', completedBy: [], comments: {} },
            { day: 25, theme: 'Async/Await', whatToLearn: 'Синтаксис, try/catch', practice: 'Переписати проміси', completedBy: [], comments: {} },
            { day: 26, theme: 'Event Loop', whatToLearn: 'Мікро/макротаски, черга', practice: 'Візуалізація черги', completedBy: [], comments: {} },
            { day: 27, theme: 'Fetch API', whatToLearn: 'GET/POST, headers, JSON', practice: 'Робота з JSONPlaceholder', completedBy: [], comments: {} },
            { day: 28, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'Погодний додаток з API', completedBy: [], comments: {} },
            { day: 29, theme: 'Closures', whatToLearn: 'Замикання, приватні змінні', practice: 'Лічильники, фабрики', completedBy: [], comments: {} },
            { day: 30, theme: 'This контекст', whatToLearn: 'bind, call, apply, стрілкові vs звичайні', practice: 'Калькулятор з методами', completedBy: [], comments: {} },
            { day: 31, theme: 'Прототипи', whatToLearn: 'Prototype chain, наслідування', practice: 'Власний Array.prototype метод', completedBy: [], comments: {} },
            { day: 32, theme: 'Classes', whatToLearn: 'Constructor, методи, extends', practice: 'ООП гра (персонажі)', completedBy: [], comments: {} },
            { day: 33, theme: 'Error handling', whatToLearn: 'try/catch, custom errors', practice: 'Валідатор з помилками', completedBy: [], comments: {} },
            { day: 34, theme: 'LocalStorage', whatToLearn: 'Збереження даних, JSON', practice: 'Зберігання стану додатку', completedBy: [], comments: {} },
            { day: 35, theme: '🎯 Фінальний проект', whatToLearn: 'Об\'єднання всіх знань', practice: 'Менеджер задач з localStorage', completedBy: [], comments: {} },
        ]
    },
    {
        id: 'ts',
        title: 'TypeScript',
        totalDays: 21,
        topics: [
            { day: 36, theme: 'Встановлення', whatToLearn: 'npm, tsc, tsconfig.json', practice: 'Налаштування проекту', completedBy: [], comments: {} },
            { day: 37, theme: 'Базові типи', whatToLearn: 'string, number, boolean, any, void', practice: 'Типізувати JS код', completedBy: [], comments: {} },
            { day: 38, theme: 'Масиви та кортежі', whatToLearn: 'number[], Array<T>, [string, number]', practice: 'Типізований TODO', completedBy: [], comments: {} },
            { day: 39, theme: 'Об\'єкти', whatToLearn: 'Inline типи, optional (?), readonly', practice: 'Інтерфейс користувача', completedBy: [], comments: {} },
            { day: 40, theme: 'Type vs Interface', whatToLearn: 'Різниця, коли що використовувати', practice: 'Моделі даних', completedBy: [], comments: {} },
            { day: 41, theme: 'Union та Intersection', whatToLearn: '| та &, дискримінантні union', practice: 'Різні типи повідомлень', completedBy: [], comments: {} },
            { day: 42, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'Типізувати попередній JS проект', completedBy: [], comments: {} },
            { day: 43, theme: 'Generics основи', whatToLearn: '<T>, функції та класи', practice: 'Універсальні функції', completedBy: [], comments: {} },
            { day: 44, theme: 'Generics constraints', whatToLearn: 'extends, keyof, typeof', practice: 'Безпечний доступ до полів', completedBy: [], comments: {} },
            { day: 45, theme: 'Utility types', whatToLearn: 'Partial, Required, Pick, Omit', practice: 'Трансформація типів', completedBy: [], comments: {} },
            { day: 46, theme: 'Enum', whatToLearn: 'Числові, строкові, const enum', practice: 'Статуси та константи', completedBy: [], comments: {} },
            { day: 47, theme: 'Type guards', whatToLearn: 'typeof, instanceof, in, is', practice: 'Безпечна робота з union', completedBy: [], comments: {} },
            { day: 48, theme: 'Assertions', whatToLearn: 'as, !, ?? (nullish)', practice: 'Робота з DOM', completedBy: [], comments: {} },
            { day: 49, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'API клієнт з типами', completedBy: [], comments: {} },
            { day: 50, theme: 'Функції глибше', whatToLearn: 'Overloading, this типи', practice: 'Поліморфні функції', completedBy: [], comments: {} },
            { day: 51, theme: 'Classes в TS', whatToLearn: 'Модифікатори доступу, abstract', practice: 'ООП архітектура', completedBy: [], comments: {} },
            { day: 52, theme: 'Декоратори', whatToLearn: 'Class, method, property', practice: 'Валідація через декоратори', completedBy: [], comments: {} },
            { day: 53, theme: 'Модулі та namespace', whatToLearn: 'Організація коду, ambient', practice: 'Структура проекту', completedBy: [], comments: {} },
            { day: 54, theme: 'Робота з бібліотеками', whatToLearn: '@types, DefinitelyTyped', practice: 'Підключення lodash', completedBy: [], comments: {} },
            { day: 55, theme: 'Conditional types', whatToLearn: 'infer, mapped types', practice: 'Продвинуті типи', completedBy: [], comments: {} },
            { day: 56, theme: '🎯 Фінальний проект', whatToLearn: 'TypeScript додаток', practice: 'Типізований state manager', completedBy: [], comments: {} },
        ]
    },
    {
        id: 'react',
        title: 'React',
        totalDays: 28,
        topics: [
            { day: 57, theme: 'Встановлення', whatToLearn: 'Create React App, Vite, структура', practice: 'Hello World', completedBy: [], comments: {} },
            { day: 58, theme: 'JSX', whatToLearn: 'Синтаксис, вирази, атрибути', practice: 'Картка товару', completedBy: [], comments: {} },
            { day: 59, theme: 'Компоненти', whatToLearn: 'Функціональні, композиція', practice: 'Компонентна структура', completedBy: [], comments: {} },
            { day: 60, theme: 'Props', whatToLearn: 'Передача даних, children, типи', practice: 'Конфігуруємі компоненти', completedBy: [], comments: {} },
            { day: 61, theme: 'Стан (useState)', whatToLearn: 'Оновлення, батчінг, функції', practice: 'Лічильник, форми', completedBy: [], comments: {} },
            { day: 62, theme: 'Події', whatToLearn: 'onClick, onChange, preventDefault', practice: 'Інтерактивні елементи', completedBy: [], comments: {} },
            { day: 63, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'Калькулятор на React', completedBy: [], comments: {} },
            { day: 64, theme: 'Списки та ключі', whatToLearn: 'map, key prop, оптимізація', practice: 'Динамічний список', completedBy: [], comments: {} },
            { day: 65, theme: 'useEffect', whatToLearn: 'Side effects, cleanup, deps', practice: 'Таймер, API запити', completedBy: [], comments: {} },
            { day: 66, theme: 'useContext', whatToLearn: 'Створення, Provider, споживання', practice: 'Тема додатку', completedBy: [], comments: {} },
            { day: 67, theme: 'useReducer', whatToLearn: 'Actions, dispatch, складний стан', practice: 'Корзина товарів', completedBy: [], comments: {} },
            { day: 68, theme: 'useMemo', whatToLearn: 'Мемоізація обчислень', practice: 'Фільтрація великих списків', completedBy: [], comments: {} },
            { day: 69, theme: 'useCallback', whatToLearn: 'Мемоізація функцій', practice: 'Оптимізація дочірніх', completedBy: [], comments: {} },
            { day: 70, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'TODO з всіма хуками', completedBy: [], comments: {} },
            { day: 71, theme: 'useRef', whatToLearn: 'DOM refs, збереження значень', practice: 'Фокус, скрол', completedBy: [], comments: {} },
            { day: 72, theme: 'Custom Hooks', whatToLearn: 'Створення, композиція', practice: 'useLocalStorage, useFetch', completedBy: [], comments: {} },
            { day: 73, theme: 'React.memo', whatToLearn: 'Оптимізація рендерів', practice: 'Профілювання', completedBy: [], comments: {} },
            { day: 74, theme: 'Error Boundaries', whatToLearn: 'Обробка помилок UI', practice: 'Fallback компоненти', completedBy: [], comments: {} },
            { day: 75, theme: 'Lazy та Suspense', whatToLearn: 'Code splitting, lazy loading', practice: 'Розбиття бандла', completedBy: [], comments: {} },
            { day: 76, theme: 'Portals', whatToLearn: 'Рендер поза ієрархією', practice: 'Модальні вікна', completedBy: [], comments: {} },
            { day: 77, theme: '📝 Практика', whatToLearn: 'Домашнє завдання', practice: 'Оптимізований додаток', completedBy: [], comments: {} },
            { day: 78, theme: 'React Router', whatToLearn: 'Routes, Link, параметри', practice: 'SPA навігація', completedBy: [], comments: {} },
            { day: 79, theme: 'Форми', whatToLearn: 'Controlled, validation', practice: 'Складна форма', completedBy: [], comments: {} },
            { day: 80, theme: 'CSS-in-JS', whatToLearn: 'styled-components основи', practice: 'Стилізовані компоненти', completedBy: [], comments: {} },
            { day: 81, theme: 'Compound Components', whatToLearn: 'Складні компоненти', practice: 'Accordion, Tabs', completedBy: [], comments: {} },
            { day: 82, theme: 'TypeScript + React', whatToLearn: 'Типізація компонентів', practice: 'Безпечні пропси', completedBy: [], comments: {} },
            { day: 83, theme: 'Testing', whatToLearn: 'React Testing Library', practice: 'Тести компонентів', completedBy: [], comments: {} },
            { day: 84, theme: '🎯 Фінальний проект', whatToLearn: 'Повноцінний додаток', practice: 'Блог з Router та API', completedBy: [], comments: {} },
        ]
    }
];

// --- Компоненти UI ---

const Modal = ({ topic, onClose, onAddComment, userId, planData }) => {
    const [comment, setComment] = useState('');
    
    if (!topic) return null;

    const handleSubmit = () => {
        if (comment.trim()) {
            onAddComment(topic.day, comment);
            setComment('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative border border-gray-700/50 animate-slideUp">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300 text-2xl"
                >
                    ×
                </button>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    День {topic.day}: {topic.theme}
                </h3>
                
                <div className="space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                        <h4 className="font-semibold text-lg text-cyan-400 mb-2 flex items-center">
                            <span className="mr-2">📚</span> Що вивчаємо:
                        </h4>
                        <p className="text-gray-300 leading-relaxed">{topic.whatToLearn}</p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                        <h4 className="font-semibold text-lg text-purple-400 mb-2 flex items-center">
                            <span className="mr-2">💻</span> Практика:
                        </h4>
                        <p className="text-gray-300 leading-relaxed">{topic.practice}</p>
                    </div>

                    {/* Коментарі */}
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                        <h4 className="font-semibold text-lg text-green-400 mb-3 flex items-center">
                            <CommentIcon className="mr-2" /> Коментарі:
                        </h4>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                            {Object.entries(topic.comments || {}).map(([uid, userComments]) => {
                                const isMe = uid === userId;
                                const userName = isMe ? 'Ви' : 'Партнер';
                                
                                return userComments.map((comment, idx) => (
                                    <div key={`${uid}-${idx}`} className={`p-2 rounded-lg ${isMe ? 'bg-cyan-900/30' : 'bg-purple-900/30'}`}>
                                        <p className="text-sm text-gray-300">
                                            <span className={`font-semibold ${isMe ? 'text-cyan-400' : 'text-purple-400'}`}>
                                                {userName}:
                                            </span> {comment}
                                        </p>
                                    </div>
                                ));
                            })}
                            {(!topic.comments || Object.keys(topic.comments).length === 0) && (
                                <p className="text-gray-500 text-sm">Поки немає коментарів</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                placeholder="Додати коментар..."
                                className="flex-1 bg-gray-700/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-600/50 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                            />
                            <button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105"
                            >
                                Додати
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProgressBar = ({ progress, color = "from-cyan-500 to-purple-600" }) => (
    <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm overflow-hidden">
        <div
            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out relative`}
            style={{ width: `${progress}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
        </div>
    </div>
);

const Topic = ({ topic, onToggle, onShowMaterials, userId, partnerId }) => {
    const isCompletedByMe = topic.completedBy.includes(userId);
    const isCompletedByPartner = partnerId && topic.completedBy.includes(partnerId);
    const hasComments = topic.comments && Object.keys(topic.comments).length > 0;

    return (
        <div className={`
            flex items-center justify-between p-4 rounded-xl mb-3 
            transition-all duration-300 transform hover:scale-[1.02]
            ${isCompletedByMe 
                ? 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/30' 
                : 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600/50 hover:from-gray-700 hover:to-gray-600'
            }
            border backdrop-blur-sm
        `}>
            <div className="flex items-center space-x-3">
                <label className="relative cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={isCompletedByMe}
                        onChange={onToggle}
                    />
                    <div className={`
                        w-6 h-6 rounded-lg border-2 transition-all duration-300
                        ${isCompletedByMe 
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-600 border-transparent' 
                            : 'border-gray-500 hover:border-cyan-500'
                        }
                    `}>
                        {isCompletedByMe && (
                            <CheckIcon className="w-full h-full text-white p-0.5" />
                        )}
                    </div>
                </label>
                
                <div>
                    <span className={`
                        text-gray-300 transition-all duration-300
                        ${isCompletedByMe ? 'line-through opacity-60' : ''}
                    `}>
                        День {topic.day}: {topic.theme}
                    </span>
                    {hasComments && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                            <CommentIcon className="w-3 h-3 mr-1" />
                            <span>{Object.values(topic.comments).flat().length} коментарів</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
                {isCompletedByPartner && (
                    <div className="flex items-center bg-purple-500/20 px-2 py-1 rounded-full">
                        <UserIcon className="w-4 h-4" />
                        <span className="text-xs text-purple-400 ml-1 font-medium">Виконано</span>
                    </div>
                )}
                <button 
                    onClick={onShowMaterials} 
                    className="
                        text-sm bg-gradient-to-r from-gray-600 to-gray-700 
                        hover:from-cyan-600 hover:to-purple-700 
                        text-white font-medium py-2 px-4 rounded-lg 
                        transition-all duration-300 transform hover:scale-105
                        hover:shadow-lg hover:shadow-purple-500/20
                    "
                >
                    Деталі
                </button>
            </div>
        </div>
    );
};

const LearningBlock = ({ block, onTopicToggle, onShowMaterials, userId, users, onAddComment }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const myProgress = useMemo(() => {
        const myCompleted = block.topics.filter(topic => topic.completedBy.includes(userId)).length;
        return (myCompleted / block.topics.length) * 100;
    }, [block.topics, userId]);
    
    const partnerId = users.find(u => u !== userId);
    const partnerProgress = useMemo(() => {
        if (!partnerId) return 0;
        const partnerCompleted = block.topics.filter(topic => topic.completedBy.includes(partnerId)).length;
        return (partnerCompleted / block.topics.length) * 100;
    }, [block.topics, partnerId]);

    return (
        <div className={`
            bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-2xl 
            shadow-xl border border-gray-700/50 backdrop-blur-sm
            transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10
        `}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        {block.title}
                    </h2>
                    <div className="text-right">
                        <div className="text-cyan-400 font-mono text-lg font-bold">{Math.round(myProgress)}%</div>
                        {partnerId && (
                            <div className="text-purple-400 font-mono text-sm">Партнер: {Math.round(partnerProgress)}%</div>
                        )}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-cyan-400">Ваш прогрес</span>
                        <span className="text-cyan-400 font-mono">{Math.round(myProgress)}%</span>
                    </div>
                    <ProgressBar progress={myProgress} color="from-cyan-500 to-cyan-600" />
                    
                    {partnerId && (
                        <>
                            <div className="flex items-center justify-between text-sm mb-1 mt-3">
                                <span className="text-purple-400">Прогрес партнера</span>
                                <span className="text-purple-400 font-mono">{Math.round(partnerProgress)}%</span>
                            </div>
                            <ProgressBar progress={partnerProgress} color="from-purple-500 to-purple-600" />
                        </>
                    )}
                </div>
                
                <div className="mt-4 text-center">
                    <span className="text-gray-400 text-sm">
                        {isOpen ? '▲ Згорнути' : '▼ Розгорнути'}
                    </span>
                </div>
            </div>
            
            {isOpen && (
                <div className="mt-6 animate-fadeIn">
                    {block.topics.map(topic => (
                        <Topic
                            key={topic.day}
                            topic={topic}
                            onToggle={() => onTopicToggle(block.id, topic.day)}
                            onShowMaterials={() => onShowMaterials(topic)}
                            userId={userId}
                            partnerId={partnerId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const StatsCard = ({ icon, title, value, color }) => (
    <div className={`
        bg-gradient-to-br ${color} p-6 rounded-2xl 
        shadow-lg border border-gray-700/50 backdrop-blur-sm
        transform transition-all duration-300 hover:scale-105 hover:shadow-xl
    `}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className="text-4xl opacity-50">{icon}</div>
        </div>
    </div>
);

const TrackerDashboard = ({ planData, handleTopicToggle, userId, appId, onAddComment, userProfiles }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showStats, setShowStats] = useState(false);

    const stats = useMemo(() => {
        const allTopics = planData.plan.flatMap(block => block.topics);
        const myCompleted = allTopics.filter(t => t.completedBy.includes(userId)).length;
        const totalTopics = allTopics.length;
        
        const partnerId = planData.users.find(u => u !== userId);
        const partnerCompleted = partnerId ? allTopics.filter(t => t.completedBy.includes(partnerId)).length : 0;
        
        // Обчислення streak
        const today = new Date().toDateString();
        const myStreak = userProfiles[userId]?.lastActivity === today ? (userProfiles[userId]?.streak || 0) : 0;
        
        return {
            myCompleted,
            totalTopics,
            myProgress: Math.round((myCompleted / totalTopics) * 100),
            partnerCompleted,
            partnerProgress: Math.round((partnerCompleted / totalTopics) * 100),
            myStreak,
            daysLeft: totalTopics - myCompleted
        };
    }, [planData, userId, userProfiles]);

    const handleCopy = () => {
        navigator.clipboard.writeText(appId).then(() => {
            alert('ID скопійовано! 🎉');
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
                <Modal 
                    topic={selectedTopic} 
                    onClose={() => setSelectedTopic(null)}
                    onAddComment={onAddComment}
                    userId={userId}
                    planData={planData}
                />
                
                {/* Header */}
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-2xl shadow-xl border border-gray-700/50 backdrop-blur-sm text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                        Спільний трекер навчання
                    </h1>
                    <p className="text-gray-400 mt-3">Ваш спільний ID плану:</p>
                    <div className="flex items-center justify-center mt-3 bg-gray-700/50 p-3 rounded-xl max-w-md mx-auto backdrop-blur-sm">
                        <code className="text-cyan-300 font-mono text-lg break-all">{appId}</code>
                        <button 
                            onClick={handleCopy} 
                            className="
                                ml-4 bg-gradient-to-r from-cyan-600 to-purple-700 
                                hover:from-cyan-500 hover:to-purple-600 
                                text-white font-bold py-2 px-4 rounded-lg 
                                transition-all duration-300 transform hover:scale-105
                                hover:shadow-lg hover:shadow-purple-500/30
                            "
                        >
                            Копіювати
                        </button>
                    </div>
                </div>

                {/* Stats Toggle */}
                <div className="text-center">
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="
                            bg-gradient-to-r from-gray-700 to-gray-800 
                            hover:from-gray-600 hover:to-gray-700
                            text-white font-medium py-2 px-6 rounded-full
                            transition-all duration-300 transform hover:scale-105
                        "
                    >
                        {showStats ? 'Приховати статистику' : 'Показати статистику'} 📊
                    </button>
                </div>

                {/* Statistics */}
                {showStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
                        <StatsCard 
                            icon={<TrophyIcon />}
                            title="Виконано"
                            value={`${stats.myCompleted}/${stats.totalTopics}`}
                            color="from-yellow-900/50 to-orange-900/50"
                        />
                        <StatsCard 
                            icon="📈"
                            title="Мій прогрес"
                            value={`${stats.myProgress}%`}
                            color="from-cyan-900/50 to-blue-900/50"
                        />
                        <StatsCard 
                            icon={<FireIcon />}
                            title="Streak"
                            value={`${stats.myStreak} днів`}
                            color="from-red-900/50 to-pink-900/50"
                        />
                        <StatsCard 
                            icon="📅"
                            title="Залишилось"
                            value={`${stats.daysLeft} днів`}
                            color="from-purple-900/50 to-indigo-900/50"
                        />
                    </div>
                )}

                {/* Users */}
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-2xl shadow-xl border border-gray-700/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">👥</span> Учасники
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {planData.users.map((user, index) => {
                            const isMe = user === userId;
                            const profile = userProfiles[user] || {};
                            const userStats = stats[isMe ? 'myCompleted' : 'partnerCompleted'];
                            const userProgress = stats[isMe ? 'myProgress' : 'partnerProgress'];
                            
                            return (
                                <div 
                                    key={user} 
                                    className={`
                                        flex items-center p-4 rounded-xl
                                        ${isMe 
                                            ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/30' 
                                            : 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/30'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                                        ${isMe 
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600' 
                                            : 'bg-gradient-to-r from-purple-500 to-pink-600'
                                        }
                                    `}>
                                        {profile.name ? profile.name[0].toUpperCase() : (isMe ? 'Я' : 'П')}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="font-semibold text-white">
                                            {profile.name || (isMe ? 'Це ви' : `Партнер ${index + 1}`)}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Виконано: {userStats} завдань ({userProgress}%)
                                        </div>
                                        {profile.lastActivity && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Остання активність: {new Date(profile.lastActivity).toLocaleDateString('uk-UA')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Learning Blocks */}
                {planData.plan.map(block => (
                    <LearningBlock
                        key={block.id}
                        block={block}
                        onTopicToggle={handleTopicToggle}
                        onShowMaterials={setSelectedTopic}
                        onAddComment={onAddComment}
                        userId={userId}
                        users={planData.users}
                    />
                ))}
            </div>
        </div>
    );
};

const JoinOrCreateScreen = ({ setAppId, createPlan, joinPlan }) => {
    const [inputAppId, setInputAppId] = useState('');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm text-center transform transition-all duration-500 hover:scale-[1.02]">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 animate-gradient">
                        Трекер Навчання
                    </h1>
                    <p className="text-gray-400 mb-8">Навчайтесь разом, досягайте більшого! 🚀</p>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={createPlan}
                            className="
                                w-full bg-gradient-to-r from-cyan-600 to-purple-700 
                                hover:from-cyan-500 hover:to-purple-600 
                                text-white font-bold py-4 px-6 rounded-xl 
                                transition-all duration-300 transform hover:scale-105
                                hover:shadow-lg hover:shadow-purple-500/30
                                relative overflow-hidden group
                            "
                        >
                            <span className="relative z-10">✨ Створити новий план</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                        
                        <div className="flex items-center text-gray-500 my-6">
                            <hr className="w-full border-gray-700" />
                            <span className="px-4 text-sm font-medium">АБО</span>
                            <hr className="w-full border-gray-700" />
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={inputAppId}
                                onChange={(e) => setInputAppId(e.target.value)}
                                placeholder="Введіть ID існуючого плану"
                                className="
                                    w-full p-4 bg-gray-700/50 text-white rounded-xl 
                                    border border-gray-600/50 
                                    focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 
                                    outline-none transition-all duration-300
                                    placeholder-gray-500
                                "
                            />
                            <button 
                                onClick={() => joinPlan(inputAppId)}
                                disabled={!inputAppId}
                                className="
                                    w-full bg-gradient-to-r from-gray-700 to-gray-800 
                                    hover:from-gray-600 hover:to-gray-700
                                    disabled:from-gray-800 disabled:to-gray-900 
                                    text-white font-bold py-4 px-6 rounded-xl 
                                    transition-all duration-300 
                                    disabled:cursor-not-allowed disabled:opacity-50
                                    transform hover:scale-105 disabled:hover:scale-100
                                "
                            >
                                🔗 Приєднатись до плану
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Головний компонент App
export default function App() {
    // Додаємо CSS анімації
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .animate-fadeIn {
                animation: fadeIn 0.5s ease-out;
            }
            
            .animate-slideUp {
                animation: slideUp 0.3s ease-out;
            }
            
            .animate-gradient {
                background-size: 200% 200%;
                animation: gradient 3s ease infinite;
            }
            
            .animate-shimmer {
                animation: shimmer 2s infinite;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    const [fb, setFb] = useState({ app: null, db: null, auth: null });
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    const [appId, setAppId] = useState(() => {
        // Зберігаємо ID плану в localStorage
        return localStorage.getItem('learningTrackerPlanId') || '';
    });
    const [planData, setPlanData] = useState(null);
    const [userProfiles, setUserProfiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Зберігаємо appId при зміні
    useEffect(() => {
        if (appId) {
            localStorage.setItem('learningTrackerPlanId', appId);
        } else {
            localStorage.removeItem('learningTrackerPlanId');
        }
    }, [appId]);
    
    // 1. Ініціалізація Firebase та автентифікація
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            setFb({ app, db, auth });

            // Перевіряємо збережений userId
            const savedUserId = localStorage.getItem('learningTrackerUserId');

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    localStorage.setItem('learningTrackerUserId', user.uid);
                } else if (savedUserId) {
                    // Якщо є збережений ID, використовуємо його
                    setUserId(savedUserId);
                } else {
                    // Тільки якщо немає збереженого ID, створюємо нового користувача
                    try {
                        const userCredential = await signInAnonymously(auth);
                        const newUserId = userCredential.user.uid;
                        setUserId(newUserId);
                        localStorage.setItem('learningTrackerUserId', newUserId);
                    } catch (authError) {
                        console.error("Помилка автентифікації:", authError);
                        setError("Не вдалося автентифікуватись.");
                    }
                }
                setIsAuthReady(true);
            });
        } catch (e) {
            console.error("Помилка ініціалізації Firebase:", e);
            setError("Помилка ініціалізації додатку.");
            setLoading(false);
        }
    }, []);

    // 2. Підписка на оновлення даних плану
    useEffect(() => {
        if (!isAuthReady || !fb.db || !appId || !userId) {
            if (isAuthReady) setLoading(false);
            return;
        };

        setLoading(true);
        setError(null);
        
        const planRef = doc(fb.db, 'plans', appId);

        const unsubscribe = onSnapshot(planRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Додаємо користувача якщо його немає
                if (data.users && !data.users.includes(userId) && data.users.length < 2) {
                    await updateDoc(planRef, {
                        users: [...data.users, userId]
                    });
                }
                
                setPlanData(data);
                
                // Завантажуємо профілі користувачів
                const profiles = {};
                for (const uid of data.users) {
                    const profileRef = doc(fb.db, 'userProfiles', uid);
                    const profileSnap = await getDoc(profileRef);
                    if (profileSnap.exists()) {
                        profiles[uid] = profileSnap.data();
                    }
                }
                setUserProfiles(profiles);
                
                // Оновлюємо активність поточного користувача
                updateUserActivity(userId);
            } else {
                setError(`План з ID "${appId}" не знайдено.`);
                setPlanData(null);
                setTimeout(() => {
                    setAppId('');
                    localStorage.removeItem('learningTrackerPlanId');
                }, 3000);
            }
            setLoading(false);
        }, (err) => {
            console.error("Помилка підписки на дані:", err);
            setError("Не вдалося завантажити дані плану.");
            setLoading(false);
        });

        return () => unsubscribe();

    }, [isAuthReady, fb.db, appId, userId]);
    
    // Оновлення активності користувача
    const updateUserActivity = async (uid) => {
        if (!fb.db || !uid) return;
        
        const profileRef = doc(fb.db, 'userProfiles', uid);
        const today = new Date().toDateString();
        
        try {
            const profileSnap = await getDoc(profileRef);
            const profileData = profileSnap.exists() ? profileSnap.data() : {};
            
            let newStreak = profileData.streak || 0;
            const lastActivity = profileData.lastActivity;
            
            // Оновлюємо streak
            if (lastActivity) {
                const lastDate = new Date(lastActivity);
                const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 1) {
                    newStreak += 1;
                } else if (daysDiff > 1) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }
            
            await setDoc(profileRef, {
                ...profileData,
                lastActivity: today,
                streak: newStreak,
                lastUpdated: serverTimestamp()
            }, { merge: true });
            
        } catch (e) {
            console.error("Помилка оновлення активності:", e);
        }
    };
    
    // Функція для створення нового плану
    const createPlan = async () => {
        if (!fb.db || !userId) return;
        setLoading(true);
        const newAppId = Math.random().toString(36).substring(2, 15);
        const planRef = doc(fb.db, 'plans', newAppId);
        
        try {
            await setDoc(planRef, {
                createdAt: new Date(),
                users: [userId],
                plan: initialPlanData
            });
            setAppId(newAppId);
        } catch(e) {
            console.error("Помилка створення плану:", e);
            setError("Не вдалося створити новий план.");
            setLoading(false);
        }
    }
    
    // Функція для приєднання до існуючого плану
    const joinPlan = async (idToJoin) => {
        if (!fb.db || !userId || !idToJoin) return;
        setLoading(true);
        const planRef = doc(fb.db, 'plans', idToJoin);
        try {
            const docSnap = await getDoc(planRef);
            if(docSnap.exists()){
                setAppId(idToJoin);
            } else {
                alert("План з таким ID не знайдено.");
                setLoading(false);
            }
        } catch (e) {
            console.error("Помилка приєднання до плану:", e);
            setError("Не вдалося приєднатись до плану.");
            setLoading(false);
        }
    };

    // Функція для відмітки/зняття теми
    const handleTopicToggle = async (blockId, topicDay) => {
        if (!planData || !userId) return;

        const newPlan = JSON.parse(JSON.stringify(planData.plan));

        const block = newPlan.find(b => b.id === blockId);
        const topic = block.topics.find(t => t.day === topicDay);

        if (topic) {
            const userIndex = topic.completedBy.indexOf(userId);
            if (userIndex > -1) {
                topic.completedBy.splice(userIndex, 1);
            } else {
                topic.completedBy.push(userId);
            }

            const planRef = doc(fb.db, 'plans', appId);
            await updateDoc(planRef, { plan: newPlan });
            
            // Оновлюємо активність
            updateUserActivity(userId);
        }
    };
    
    // Функція для додавання коментаря
    const handleAddComment = async (topicDay, comment) => {
        if (!planData || !userId || !comment.trim()) return;

        const newPlan = JSON.parse(JSON.stringify(planData.plan));

        // Знаходимо тему по дню
        let topicFound = null;
        let blockFound = null;
        
        for (const block of newPlan) {
            const topic = block.topics.find(t => t.day === topicDay);
            if (topic) {
                topicFound = topic;
                blockFound = block;
                break;
            }
        }

        if (topicFound) {
            if (!topicFound.comments) {
                topicFound.comments = {};
            }
            
            if (!topicFound.comments[userId]) {
                topicFound.comments[userId] = [];
            }
            
            topicFound.comments[userId].push(comment);

            const planRef = doc(fb.db, 'plans', appId);
            await updateDoc(planRef, { plan: newPlan });
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-xl animate-pulse">Завантаження...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
                <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 max-w-md text-center">
                    <p className="text-red-400 text-xl">⚠️ {error}</p>
                </div>
            </div>
        );
    }

    if (!appId || !planData) {
        return <JoinOrCreateScreen setAppId={setAppId} createPlan={createPlan} joinPlan={joinPlan}/>;
    }

    return (
        <main className="min-h-screen">
            <TrackerDashboard 
                planData={planData}
                handleTopicToggle={handleTopicToggle}
                onAddComment={handleAddComment}
                userId={userId}
                appId={appId}
                userProfiles={userProfiles}
            />
        </main>
    );
}