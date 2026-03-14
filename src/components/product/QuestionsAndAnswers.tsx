'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider'; // Standard path for shadcn/toast pattern
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'; 
import CalendarIcon from '@/components/icons/VanIcon'; 
import SearchIcon from '@/components/icons/VanIcon'; 

interface QAPair {
  id: number;
  question: string;
  answer: string;
  author: string;
  date: string;
}

const qaData: QAPair[] = [
  {
    id: 1,
    question: "Any side effect to this product ?",
    answer: "There is no any side effect of this product its completely safe to use",
    author: "Bright Nepcare Pvt. Ltd.",
    date: "2024-02-07"
  },
  {
    id: 2,
    question: "Is it safe for teenagers?",
    answer: "Yes, but we always recommend consulting a physician.",
    author: "Bright Nepcare Pvt. Ltd.",
    date: "2024-03-01"
  }
];

const QuestionsAndAnswers: React.FC = () => {
  const [question, setQuestion] = useState('');

  const { showToast } = useToast();

  const handleAsk = () => {
    if (!question.trim()) return;

   showToast(
      "Question Submitted", 
      "success", 
      "Our team will review and answer your query soon."
    );

    setQuestion(''); 
  };

  return (
    <section className="main-container relative mx-auto flex w-full max-w-[700px] flex-col items-start gap-[16px] lg:mx-0 lg:max-w-none">
      
      {/* HEADER SECTION */}
      <div className="flex w-full items-center justify-between">
        <h2 className="font-titillium text-[20px] font-semibold leading-[18px] tracking-[-0.4px] text-[#242424]">
          Questions & Answers
        </h2>
        <button 
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] border border-[#eaebf0] bg-[#fafbfc] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-transform"
        >
          <div className="w-[16px] h-[16px] rotate-[-90deg]">
            <ChevronLeftIcon className="w-full h-full text-black" />
          </div>
        </button>
      </div>

      {/* HORIZONTAL CAROUSEL */}
      <div className="flex w-full flex-nowrap gap-[16px] overflow-x-auto no-scrollbar pb-2">
        {qaData.map((item) => (
          <div 
            key={item.id}
            className="flex w-[300px]  flex-shrink-0 flex-col items-start rounded-[12px_0_12px_12px] border-[2px] border-white bg-white p-[2px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] transition-all"
          >
            {/* QUESTION BOX (Top) */}
            <div className="flex w-full flex-col gap-[10px] items-start rounded-[12px_0_12px_12px] bg-[#3f9633] p-[12px] shrink-0">
              <div className="flex items-start gap-[4px] font-titillium text-[16px] leading-[16px] tracking-[-0.32px] text-white">
                <span className="font-semibold">Qn.</span>
                <span className="font-normal leading-[19.2px] line-clamp-1">{item.question}</span>
              </div>
            </div>

            {/* ANSWER BOX (Bottom - Fill Space) */}
            <div className="flex flex-1 w-full flex-col justify-between items-start p-[8px_12px_10px_12px]">
              {/* Answer Text */}
              <div className="font-titillium text-[16px] leading-[22px] tracking-[-0.32px] text-[#242424] line-clamp-3">
                <span className="font-semibold">Ans. </span>
                <span className="font-normal">{item.answer}</span>
              </div>

              {/* META INFO (Always at Bottom) */}
              <div className="flex w-full items-center justify-between pt-2">
                <div className="font-titillium text-[11px] leading-[14px] tracking-[-0.22px]">
                  <span className="text-[#656565]">Answered by : </span>
                  <span className="text-[#242424] font-medium">{item.author}</span>
                </div>
                <div className="flex items-center gap-[4px]">
                  <CalendarIcon className="w-[10px] h-[10px] text-[#575757]" />
                  <span className="font-titillium text-[11px] leading-[10px] tracking-[-0.22px] text-[#575757]">
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT / SUBMISSION SECTION */}
      <div className="flex w-full items-stretch overflow-hidden rounded-[6px] shadow-sm border border-[#eaebf0]">
        <div className="flex-1 flex items-center bg-white px-[16px] gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Have a Question? Ask"
            className="flex-1 h-[42px] bg-transparent font-inter text-[15px] font-medium text-[#252525] placeholder-[#252525]/50 outline-none"
          />
          <div className="h-[20px] w-[20px] opacity-30 flex-shrink-0">
             <SearchIcon className="w-full h-full text-black" />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAsk}
          className="flex h-[42px] w-[64px] items-center justify-center bg-[#242424] px-[16px] transition-all active:bg-black active:scale-95 shrink-0"
        >
          <span className="font-inter text-[14px] font-semibold leading-[20px] tracking-[0.1px] text-white">
            Ask
          </span>
        </button>
      </div>

    </section>
  );
};

export default QuestionsAndAnswers;