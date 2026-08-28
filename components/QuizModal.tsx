import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Flame, RefreshCw, CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import { ChemicalElement, Language } from '../types';
import { ELEMENTS } from '../data';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface Question {
  type: 'symbol' | 'atomicNumber' | 'category' | 'fact';
  prompt: string;
  bengaliPrompt: string;
  correctElement: ChemicalElement;
  options: ChemicalElement[];
  explanation: string;
  bengaliExplanation: string;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, lang }) => {
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // atomicNumber
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);

  const generateQuestion = (): Question => {
    // Pick a random element from the 118 elements
    const correct = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];

    // Pick 3 distinct wrong elements
    const wrongOptions: ChemicalElement[] = [];
    while (wrongOptions.length < 3) {
      const candidate = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
      if (candidate.atomicNumber !== correct.atomicNumber && !wrongOptions.some(e => e.atomicNumber === candidate.atomicNumber)) {
        wrongOptions.push(candidate);
      }
    }

    // Shuffle options
    const options = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);

    // Pick question style
    const qTypes: ('symbol' | 'atomicNumber' | 'category' | 'fact')[] = ['symbol', 'atomicNumber', 'category', 'fact'];
    const qType = qTypes[Math.floor(Math.random() * qTypes.length)];

    if (qType === 'symbol') {
      return {
        type: 'symbol',
        prompt: `What is the chemical symbol for ${correct.name}?`,
        bengaliPrompt: `${correct.bengaliName} মৌলটির রাসায়নিক প্রতীক কোনটি?`,
        correctElement: correct,
        options,
        explanation: `${correct.name}'s chemical symbol is ${correct.symbol} (Atomic Number: ${correct.atomicNumber}).`,
        bengaliExplanation: `${correct.bengaliName}-এর রাসায়নিক প্রতীক হলো ${correct.symbol} (পারমাণবিক সংখ্যা: ${correct.atomicNumber})।`,
      };
    } else if (qType === 'atomicNumber') {
      return {
        type: 'atomicNumber',
        prompt: `Which element has Atomic Number ${correct.atomicNumber}?`,
        bengaliPrompt: `কোন মৌলটির পারমাণবিক সংখ্যা ${correct.atomicNumber}?`,
        correctElement: correct,
        options,
        explanation: `Atomic Number ${correct.atomicNumber} belongs to ${correct.name} (${correct.symbol}).`,
        bengaliExplanation: `পারমাণবিক সংখ্যা ${correct.atomicNumber} হলো ${correct.bengaliName} (${correct.symbol})-এর।`,
      };
    } else if (qType === 'category') {
      return {
        type: 'category',
        prompt: `Which of these elements belongs to the "${correct.category}" family?`,
        bengaliPrompt: `নিচের কোন মৌলটি "${correct.bengaliCategory}" পরিবারের অন্তর্ভুক্ত?`,
        correctElement: correct,
        options,
        explanation: `${correct.name} is classified as a ${correct.category} in the ${correct.block.toUpperCase()}-block.`,
        bengaliExplanation: `${correct.bengaliName} হলো একটি ${correct.bengaliCategory} (${correct.block.toUpperCase()}-ব্লক)।`,
      };
    } else {
      return {
        type: 'fact',
        prompt: `Which element is known for: "${correct.funFact || correct.summary}"?`,
        bengaliPrompt: `কোন মৌলটির বৈশিষ্ট্য: "${correct.funFact || correct.bengaliSummary}"?`,
        correctElement: correct,
        options,
        explanation: `This is a key characteristic of ${correct.name} (${correct.symbol}).`,
        bengaliExplanation: `এটি ${correct.bengaliName} (${correct.symbol})-এর একটি বিশেষ বৈশিষ্ট্য।`,
      };
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isOpen]);

  const handleSelectOption = (element: ChemicalElement) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswer(element.atomicNumber);
    setIsAnswered(true);
    setTotalAnswered(prev => prev + 1);

    if (element.atomicNumber === currentQuestion.correctElement.atomicNumber) {
      setScore(prev => prev + 10);
      setStreak(prev => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  if (!isOpen || !currentQuestion) return null;

  const isCorrect = selectedAnswer === currentQuestion.correctElement.atomicNumber;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 md:px-8 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award size={20} />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                  {lang === 'bn' ? 'ক্যামিস্ট্রি মাস্টার কুইজ' : 'Chemistry Master Quiz'}
                </h2>
                <p className="text-[10px] text-white/50 tracking-widest uppercase">
                  {lang === 'bn' ? 'পর্যায় সারণী জ্ঞান পরীক্ষা' : 'Periodic Table Challenge'}
                </p>
              </div>
            </div>

            {/* Score & Streak Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <Flame size={14} className="animate-bounce" />
                <span>{streak} {lang === 'bn' ? 'স্ট্রিক' : 'Streak'}</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                {score} {lang === 'bn' ? 'পয়েন্ট' : 'pts'}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Question Body */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
                <HelpCircle size={140} />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                {lang === 'bn' ? `প্রশ্ন #${totalAnswered + 1}` : `Question #${totalAnswered + 1}`}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-white leading-snug">
                {lang === 'bn' ? currentQuestion.bengaliPrompt : currentQuestion.prompt}
              </h3>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => {
                const isThisSelected = selectedAnswer === option.atomicNumber;
                const isThisCorrect = option.atomicNumber === currentQuestion.correctElement.atomicNumber;

                let btnStyle = 'bg-white/5 border-white/10 hover:border-white/30 text-slate-200';
                if (isAnswered) {
                  if (isThisCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                  } else if (isThisSelected) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-white/[0.02] border-white/5 opacity-40 text-slate-500';
                  }
                }

                return (
                  <motion.button
                    key={option.atomicNumber}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center font-mono font-black text-sm text-cyan-400">
                        {option.symbol}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-white">
                          {lang === 'bn' ? option.bengaliName : option.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {lang === 'bn' ? `পরমাণু #${option.atomicNumber}` : `Atomic #${option.atomicNumber}`}
                        </p>
                      </div>
                    </div>

                    {isAnswered && isThisCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    )}
                    {isAnswered && isThisSelected && !isThisCorrect && (
                      <XCircle size={18} className="text-rose-400" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Answer Feedback & Explanation */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border ${
                  isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs leading-relaxed">
                    <strong className="block mb-1 text-sm font-bold">
                      {isCorrect ? (lang === 'bn' ? '🎉 দারুণ! সঠিক উত্তর।' : '🎉 Excellent! Correct Answer.') : (lang === 'bn' ? '❌ ভুল উত্তর।' : '❌ Incorrect.')}
                    </strong>
                    <p className="opacity-90">
                      {lang === 'bn' ? currentQuestion.bengaliExplanation : currentQuestion.explanation}
                    </p>
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shrink-0 shadow-lg"
                  >
                    <span>{lang === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                    <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuizModal;

