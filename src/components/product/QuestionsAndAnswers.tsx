'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider'; // Standard path for shadcn/toast pattern
import DropDownIcon from '@/components/icons/DropDownIcon';
import CalendarIcon from '@/components/icons/VanIcon';
import SearchIcon from '@/components/icons/VanIcon';

import type { QAPair } from '@/services/productService';

interface QuestionsAndAnswersProps {
  qaPairs: QAPair[];
}

const QuestionsAndAnswers: React.FC<QuestionsAndAnswersProps> = ({ qaPairs = [] }) => {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

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
    <section className="main-container relative mx-auto flex w-full max-w-[700px] flex-col items-center gap-[16px] lg:mx-0 lg:max-w-none border-b border-[#F1F5F9] pb-[24px]">

      {/* HEADER SECTION */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between cursor-pointer select-none group px-[24px]"
      >
        <h2 className="font-rajdhani text-[20px] font-semibold leading-[18px] tracking-[-0.4px] text-[#242424] group-active:opacity-80 transition-opacity">
          Questions & Answers
        </h2>
        <button
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px]  outline-none overflow-hidden group-active:scale-95 transition-transform duration-300"
        >
          <div className={`w-[16px] h-[16px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            <DropDownIcon className="w-full h-full text-black" />
          </div>
        </button>
      </div>

      {isExpanded && (
        <>
          {/* HORIZONTAL CAROUSEL */}
          <div className="flex w-full flex-nowrap gap-[16px] overflow-x-auto no-scrollbar pb-2 px-[24px]">
            {qaPairs.length === 0 ? (
              <div className="px-[12px] py-[12px] text-sm text-[#797979]">No questions yet. Feel free to ask below!</div>
            ) : qaPairs.map((item) => (
              <div
                key={item.id}
                className="flex w-[300px]  flex-shrink-0 flex-col items-start rounded-[12px_0_12px_12px] border-[2px] border-white bg-white p-[2px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] transition-all"
              >
                {/* QUESTION BOX (Top) */}
                <div className="flex w-full flex-col gap-[10px] items-start rounded-[12px_0_12px_12px] bg-[#3f9633] p-[12px] shrink-0">
                  <div className="flex items-start gap-[4px] font-rajdhani text-[16px] leading-[16px] tracking-[-0.32px] text-white">
                    <span className="font-semibold">Qn.</span>
                    <span className="font-medium leading-[19.2px] line-clamp-1">{item.question}</span>
                  </div>
                </div>

                {/* ANSWER BOX (Bottom - Fill Space) */}
                <div className="flex flex-1 w-full flex-col justify-between items-start p-[8px_12px_10px_12px]">
                  {/* Answer Text */}
                  <div className="font-rajdhani text-[16px] leading-[22px] tracking-[-0.32px] text-[#242424] line-clamp-3">
                    <span className="font-semibold">Ans. </span>
                    <span className="font-medium">{item.answer}</span>
                  </div>

                  {/* META INFO (Always at Bottom) */}
                  <div className="flex w-full items-center justify-between pt-2">
                    <div className="font-rajdhani text-[11px] leading-[14px] tracking-[-0.22px]">
                      <span className="text-[#656565]">Answered by : </span>
                      <span className="text-[#242424] font-medium">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <CalendarIcon className="w-[10px] h-[10px] text-[#575757]" />
                      <span className="font-rajdhani text-[11px] leading-[10px] tracking-[-0.22px] text-[#575757]">
                        {new Date(item.created_at).toISOString().split('T')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT / SUBMISSION SECTION */}
          <div className="flex px-[24px] w-full">
            <div className="flex w-full items-stretch overflow-hidden rounded-[6px]  border border-[#eaebf0]">
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
          </div>
        </>
      )}

    </section>
  );
};

export default QuestionsAndAnswers;
