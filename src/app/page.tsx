// D:\expert-club-ai\expert-club-ai\src\app\page.tsx
'use client';

import Link from 'next/link';
import { Sparkles, Users, Zap, Scale, Eye, BrainCircuit, Target, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-main text-text-secondary">
        Загрузка...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-bg-main text-text-main">
      
      {/* Главный заголовок и слоган */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-pixel text-accent-primary uppercase tracking-wide leading-tight">
          ДИСКУССИОННЫЙ КЛУБ ЭКСПЕРТОВ AI
        </h1>
        <p className="mt-6 text-xl md:text-2xl font-sans text-text-secondary">
          Пропустите через адскую мясорубку <span className="text-accent-secondary font-bold">ЛЮБУЮ</span> свою идею!
        </p>
      </div>

      {/* Основной хук - крупно и ярко */}
      <section className="max-w-5xl text-center mb-16">
        <div className="bg-gradient-to-r from-bg-surface/30 to-bg-surface/10 p-8 rounded-xl border border-accent-primary/20 shadow-2xl">
          <p className="text-2xl md:text-3xl font-sans text-text-main leading-relaxed">
            Место, где ваши замыслы сталкиваются с <span className="text-accent-secondary font-bold">бескомпромиссными дебатами</span> между группой специализированных AI-экспертов
          </p>
        </div>
      </section>

      {/* Что можно делать - блоками */}
      <section className="max-w-6xl mb-16">
        <h2 className="text-4xl font-pixel text-accent-primary uppercase text-center mb-12">
          Создавай экспертов как хочешь:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Блок 1 */}
          <div className="bg-bg-surface/40 p-8 rounded-lg border border-accent-success/30 hover:border-accent-success/60 transition-all duration-300">
            <div className="flex items-center mb-4">
              <BrainCircuit className="h-8 w-8 text-accent-success mr-3" />
              <h3 className="text-2xl font-pixel text-accent-success uppercase">Любой характер</h3>
            </div>
            <p className="text-lg text-text-main leading-relaxed">
              <span className="text-accent-success font-bold">Гением идей или полным идиотом</span><br/>
              Настраивай характер, тип мышления, контекст, экспертизу<br/>
              Можешь запрограммировать его енотом - всем пофиг, тут можно <span className="text-accent-primary font-bold">ВСЁ</span>
            </p>
          </div>

          {/* Блок 2 */}
          <div className="bg-bg-surface/40 p-8 rounded-lg border border-accent-secondary/30 hover:border-accent-secondary/60 transition-all duration-300">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-accent-secondary mr-3" />
              <h3 className="text-2xl font-pixel text-accent-secondary uppercase">Сколько угодно</h3>
            </div>
            <p className="text-lg text-text-main leading-relaxed">
              Сделай двух, трёх, четырёх...<br/>
              <span className="text-accent-secondary font-bold">Да создавай сколько душе угодно!</span><br/>
              Каждый со своими мозгами и подходом к задачам
            </p>
          </div>
        </div>
      </section>

      {/* Главная фишка - выделено отдельно */}
      <section className="max-w-5xl mb-16">
        <div className="bg-gradient-to-r from-accent-danger/20 to-accent-primary/20 p-10 rounded-xl border-2 border-accent-danger/40 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Target className="h-12 w-12 text-accent-danger mr-4" />
            <h2 className="text-3xl font-pixel text-accent-danger uppercase">А потом знаешь что?</h2>
          </div>
          <p className="text-xl md:text-2xl text-center text-text-main leading-relaxed">
            Берёшь свою мысль и кидаешь этим <span className="text-accent-secondary font-bold">интеллектуальным зверям</span> на растерзание, на улучшение.<br/>
            Пишешь цель - они её выполнят. И ты <span className="text-accent-primary font-bold">держишь штурвал</span>.
          </p>
        </div>
      </section>

      {/* Фичи - компактно и с иконками */}
      <section className="max-w-6xl mb-16">
        <h2 className="text-4xl font-pixel text-amber-400 uppercase text-center mb-12">
          Фичи для тех, кто не боится:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-bg-surface/50 p-6 rounded-lg border border-bg-surface shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent-primary/50">
            <Users className="h-12 w-12 text-accent-primary mx-auto mb-4" />
            <h3 className="text-xl font-pixel text-accent-primary uppercase mb-3 text-center">Команда на прокачку</h3>
            <p className="text-text-secondary text-center">
              AI-агенты с уникальными мозгами, никаких банальных ботов
            </p>
          </div>
          
          <div className="bg-bg-surface/50 p-6 rounded-lg border border-bg-surface shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent-secondary/50">
            <Zap className="h-12 w-12 text-accent-secondary mx-auto mb-4" />
            <h3 className="text-xl font-pixel text-accent-secondary uppercase mb-3 text-center">Настоящие споры</h3>
            <p className="text-text-secondary text-center">
              Жёсткие совещания: конфликты, поиск истины - никаких шаблонов
            </p>
          </div>
          
          <div className="bg-bg-surface/50 p-6 rounded-lg border border-bg-surface shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent-success/50">
            <Eye className="h-12 w-12 text-accent-success mx-auto mb-4" />
            <h3 className="text-xl font-pixel text-accent-success uppercase mb-3 text-center">Ты задаёшь сценарий</h3>
            <p className="text-text-secondary text-center">
              Направляй дискуссию, вмешивайся, подливай масла в огонь
            </p>
          </div>
        </div>
      </section>

      {/* Финальный вызов */}
      <section className="max-w-4xl mb-16">
        <div className="bg-gradient-to-r from-accent-danger/10 to-accent-primary/10 p-8 rounded-xl border border-accent-danger/30">
          <p className="text-xl text-center text-text-main leading-relaxed">
            <span className="text-accent-danger font-bold text-2xl">Здесь нет места банальному мышлению</span><br/>
            и осторожным мнениям.<br/>
            Здесь есть всё для прокачки идей до <span className="text-accent-primary font-bold">космических масштабов!</span>
          </p>
        </div>
      </section>

      {/* Призыв к действию */}
      <div className="text-center">
        <h2 className="text-4xl font-pixel text-amber-400 uppercase mb-4">
          {user ? 'Добро пожаловать обратно!' : 'Готов испытать свою идею на прочность?'}
        </h2>
        <p className="text-lg md:text-xl font-sans text-text-secondary mb-8">
          {user ? 'Продолжай доминировать над идеями!' : 'Или будешь дальше слушать безопасные советы обычных ботов?'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <Link href="/dashboard" passHref>
                <Button size="default" className="w-full sm:w-auto px-8 py-3 text-lg">
                  Перейти в Дашборд
                </Button>
              </Link>
              <Link href="/discussion/new" passHref>
                <Button variant="secondary" size="default" className="w-full sm:w-auto px-8 py-3 text-lg">
                  Новая Дискуссия
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button size="default" className="w-full sm:w-auto px-8 py-3 text-lg">
                  Начать Бесплатно
                </Button>
              </Link>
              <Link href="/signup" passHref>
                <Button variant="secondary" size="default" className="w-full sm:w-auto px-8 py-3 text-lg">
                  Создать Аккаунт
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Анимация */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in-up > *:nth-child(2) { animation-delay: 0.2s; }
        .animate-fade-in-up > *:nth-child(3) { animation-delay: 0.4s; }
        .animate-fade-in-up > *:nth-child(4) { animation-delay: 0.6s; }
      `}</style>
    </main>
  );
}